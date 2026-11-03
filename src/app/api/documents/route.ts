import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import { synthesizePRDContent } from '@/lib/omniflow/ai-engine';

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user.organizationId) {
      return NextResponse.json({ ok: true, documents: [] });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const projectId = searchParams.get('projectId') || '';
    const q = (searchParams.get('q') || '').trim();

    const documents = await prisma.document.findMany({
      where: {
        organizationId: user.organizationId,
        ...(type ? { type } : {}),
        ...(projectId ? { projectId } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true, shortName: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        incomingSyncs: {
          where: { status: 'PENDING' },
        },
      },
    });

    return NextResponse.json({ ok: true, documents });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId) {
      throw new HttpError(400, 'Organization required.');
    }

    const body = await parseJsonBody<{
      name?: string;
      description?: string;
      type?: string;
      projectId?: string;
      access?: string;
    }>(request);

    const name = (body.name || 'Untitled Document').trim();
    const type = (body.type || 'PRD').trim().toUpperCase();
    const description = (body.description || name).trim();

    const synth = synthesizePRDContent({
      projectName: name,
      prompt: description,
      authorName: user.name || user.email,
    });

    const doc = await prisma.document.create({
      data: {
        name,
        description,
        type,
        status: 'CREATED',
        access: body.access || 'SELF',
        content: synth.content,
        currentVersion: 1,
        projectId: body.projectId || null,
        organizationId: user.organizationId,
        creatorUserId: user.id,
        meta: JSON.stringify({
          templateName: 'Generic PRD Document',
          followUpSuggestions: synth.followUpSuggestions,
        }),
      },
    });

    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: 1,
        label: 'V1 - Initial Draft',
        content: doc.content,
        metaSnapshot: doc.meta,
        createdById: user.id,
      },
    });

    return NextResponse.json({ ok: true, document: doc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
