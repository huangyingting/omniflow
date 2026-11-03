import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireWriteAccess,
} from '@/lib/api';
import {
  synthesizeProductMeta,
  synthesizeSupportingDocContent,
  synthesizeUIDesignMeta,
  type UIDesignMeta,
} from '@/lib/omniflow/ai-engine';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          include: { documents: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!document || document.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Document not found.');
    }

    const body = await parseJsonBody<{
      action?: 'apply-sync' | 'confirm-revert';
      versionNumber?: number;
    }>(request);

    if (body.action === 'confirm-revert') {
      const targetVersion = document.versions.find(
        (v) => v.versionNumber === Number(body.versionNumber)
      );
      if (!targetVersion) {
        throw new HttpError(404, 'Requested version snapshot not found.');
      }

      const nextVer = document.currentVersion + 1;
      const updated = await prisma.document.update({
        where: { id: document.id },
        data: {
          content: targetVersion.content,
          meta: targetVersion.metaSnapshot,
          currentVersion: nextVer,
        },
      });

      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          versionNumber: nextVer,
          label: `V${nextVer} (Reverted to V${targetVersion.versionNumber})`,
          content: targetVersion.content,
          metaSnapshot: targetVersion.metaSnapshot,
          createdById: user.id,
        },
      });

      return NextResponse.json({
        ok: true,
        document: updated,
        message: `Reverted document to V${targetVersion.versionNumber}.`,
      });
    }

    // Apply upstream pending sync events
    const prdDoc = document.project?.documents.find((d) => d.type === 'PRD');
    const projectName = document.project?.name || document.name;
    const shortName = document.project?.shortName || 'OM10';
    const nextVer = document.currentVersion + 1;

    let nextContent = document.content;
    let nextMeta: Record<string, unknown> = {};
    try {
      nextMeta = JSON.parse(document.meta || '{}');
    } catch {
      nextMeta = {};
    }

    if (document.type === 'UI_DESIGN') {
      const uiSynth = synthesizeUIDesignMeta({
        projectName,
        prompt: prdDoc?.description || document.description,
        styleId:
          (nextMeta.styleId as UIDesignMeta['styleId']) || 'modern-minimal',
      });
      nextMeta = {
        ...uiSynth,
        lastSyncedFromPrdVersion: prdDoc?.currentVersion || 1,
      };
    } else if (document.type === 'PRODUCT') {
      const prodSynth = synthesizeProductMeta({
        projectName,
        shortName,
        prompt: prdDoc?.description || document.description,
      });
      nextMeta = {
        ...prodSynth,
        lastSyncedFromPrdVersion: prdDoc?.currentVersion || 1,
      };
    } else if (
      document.type === 'TECH_DESIGN' ||
      document.type === 'QA_PLAN' ||
      document.type === 'RELEASE_PLAN'
    ) {
      nextContent =
        synthesizeSupportingDocContent({
          type: document.type,
          projectName,
          shortName,
          prompt: prdDoc?.description || document.description,
        }) +
        `\n\n> **Synchronized with PRD V${
          prdDoc?.currentVersion || 1
        }** on ${new Date().toLocaleString()}.\n`;
    }

    const updated = await prisma.document.update({
      where: { id: document.id },
      data: {
        content: nextContent,
        meta: JSON.stringify(nextMeta),
        currentVersion: nextVer,
      },
    });

    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: nextVer,
        label: `V${nextVer} (Synced with PRD V${prdDoc?.currentVersion || 1})`,
        content: nextContent,
        metaSnapshot: JSON.stringify(nextMeta),
        createdById: user.id,
      },
    });

    await prisma.documentSyncEvent.updateMany({
      where: {
        targetDocumentId: document.id,
        status: 'PENDING',
      },
      data: {
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      document: {
        ...updated,
        parsedMeta: nextMeta,
      },
      message: `Synchronized ${document.type} with upstream specification (V${nextVer}).`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
