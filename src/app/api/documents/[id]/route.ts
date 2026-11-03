import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import { triggerDownstreamSyncEvents } from '@/lib/omniflow/service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            documents: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                currentVersion: true,
                url: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        incomingSyncs: {
          where: { status: 'PENDING' },
          include: {
            sourceDocument: {
              select: { id: true, name: true, type: true, currentVersion: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document || document.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Document not found.');
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        targetEntityType: 'DOCUMENT',
        targetEntityId: document.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: { organizationId: document.organizationId },
      select: { id: true, name: true, description: true },
    });

    return NextResponse.json({
      ok: true,
      document: {
        ...document,
        parsedMeta: (() => {
          try {
            return JSON.parse(document.meta || '{}');
          } catch {
            return {};
          }
        })(),
      },
      siblingDocuments: document.project?.documents || [],
      chatSession,
      chatMessages: chatSession?.messages || [],
      knowledgeBases,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Document not found.');
    }

    const body = await parseJsonBody<{
      name?: string;
      content?: string;
      access?: string;
      meta?: Record<string, unknown>;
      saveVersionLabel?: string;
      triggerSync?: boolean;
    }>(request);

    let currentMeta: Record<string, unknown> = {};
    try {
      currentMeta = JSON.parse(document.meta || '{}');
    } catch {
      currentMeta = {};
    }
    const mergedMeta = body.meta
      ? { ...currentMeta, ...body.meta }
      : currentMeta;

    const nextContent =
      typeof body.content === 'string' ? body.content : document.content;
    const shouldCreateVersion = Boolean(body.saveVersionLabel);
    const nextVersion = shouldCreateVersion
      ? document.currentVersion + 1
      : document.currentVersion;

    const updated = await prisma.document.update({
      where: { id: document.id },
      data: {
        name:
          typeof body.name === 'string' && body.name.trim()
            ? body.name.trim()
            : document.name,
        content: nextContent,
        access:
          typeof body.access === 'string' ? body.access : document.access,
        currentVersion: nextVersion,
        meta: JSON.stringify(mergedMeta),
      },
    });

    if (shouldCreateVersion) {
      await prisma.documentVersion.create({
        data: {
          documentId: updated.id,
          versionNumber: nextVersion,
          label: body.saveVersionLabel || `V${nextVersion}`,
          content: nextContent,
          metaSnapshot: JSON.stringify(mergedMeta),
          createdById: user.id,
        },
      });
    }

    if (
      (shouldCreateVersion || body.triggerSync) &&
      updated.projectId &&
      (updated.type === 'PRD' || updated.type === 'UI_DESIGN')
    ) {
      await triggerDownstreamSyncEvents({
        projectId: updated.projectId,
        sourceDocumentId: updated.id,
        sourceType: updated.type,
        sourceVersion: nextVersion,
        summary: `Updated ${updated.type} to V${nextVersion} (${
          body.saveVersionLabel || 'Spec Update'
        })`,
      });
    }

    return NextResponse.json({
      ok: true,
      document: {
        ...updated,
        parsedMeta: mergedMeta,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Document not found.');
    }
    await prisma.document.delete({ where: { id: document.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
