import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import { recordAuditLog } from '@/lib/account-admission/audit';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId) {
      return NextResponse.json({ ok: true, knowledgeBases: [] });
    }

    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, username: true, email: true },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            status: true,
            chunkCount: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, knowledgeBases });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId) {
      throw new HttpError(400, 'Organization is required.');
    }

    const body = await parseJsonBody<{
      name?: string;
      description?: string;
    }>(request);

    const name = (body.name || '').trim();
    if (!name) {
      throw new HttpError(400, 'Knowledge Base name is required.');
    }

    const kb = await prisma.knowledgeBase.create({
      data: {
        name: name.slice(0, 50),
        description: (body.description || '').trim(),
        status: 'ACTIVE',
        organizationId: user.organizationId,
        creatorUserId: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, email: true },
        },
        files: true,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'knowledge_base.created',
      targetType: 'KnowledgeBase',
      targetId: kb.id,
      summary: `Created Knowledge Base "${kb.name}"`,
    });

    return NextResponse.json({ ok: true, knowledgeBase: kb }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
