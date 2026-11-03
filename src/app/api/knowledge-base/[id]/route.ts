import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import {
  answerWithKnowledgeBase,
  chunkTextContent,
} from '@/lib/omniflow/ai-engine';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!kb || kb.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Knowledge Base not found.');
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        targetEntityType: 'KNOWLEDGE_BASE',
        targetEntityId: kb.id,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({
      ok: true,
      knowledgeBase: kb,
      chatMessages: chatSession?.messages || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;

    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!kb || kb.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Knowledge Base not found.');
    }

    const body = await parseJsonBody<{
      action?: 'upload-file' | 'chat' | 'update-settings';
      fileName?: string;
      content?: string;
      mimeType?: string;
      question?: string;
      name?: string;
      description?: string;
    }>(request);

    if (body.action === 'update-settings') {
      const updated = await prisma.knowledgeBase.update({
        where: { id: kb.id },
        data: {
          name: body.name?.trim() || kb.name,
          description:
            typeof body.description === 'string'
              ? body.description.trim()
              : kb.description,
        },
      });
      return NextResponse.json({ ok: true, knowledgeBase: updated });
    }

    if (body.action === 'upload-file') {
      const fileName = (body.fileName || 'architecture-spec.md').trim();
      const rawContent = (body.content || '').trim();
      if (!rawContent) {
        throw new HttpError(400, 'File text content is required.');
      }

      const chunks = chunkTextContent(rawContent, 450);
      const fileRecord = await prisma.knowledgeBaseFile.create({
        data: {
          knowledgeBaseId: kb.id,
          fileName,
          fileSize: Buffer.byteLength(rawContent, 'utf8'),
          mimeType: body.mimeType || 'text/markdown',
          status: 'INDEXED',
          chunkCount: Math.max(1, chunks.length),
          content: rawContent,
          chunksJson: JSON.stringify(chunks),
          uploadedById: user.id,
        },
      });

      return NextResponse.json({ ok: true, file: fileRecord }, { status: 201 });
    }

    // Grounded RAG Chat
    const question = (body.question || '').trim();
    if (!question) {
      throw new HttpError(400, 'Enter a question for the Knowledge Base.');
    }

    const ragResult = answerWithKnowledgeBase({
      kbName: kb.name,
      question,
      files: kb.files,
    });

    let chatSession = await prisma.chatSession.findFirst({
      where: {
        targetEntityType: 'KNOWLEDGE_BASE',
        targetEntityId: kb.id,
      },
    });
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          name: `RAG Chat - ${kb.name}`,
          targetEntityType: 'KNOWLEDGE_BASE',
          targetEntityId: kb.id,
          organizationId: kb.organizationId,
          userId: user.id,
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'user',
        content: question,
      },
    });

    const assistantMsg = await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'assistant',
        content: ragResult.answer,
        meta: JSON.stringify({ citations: ragResult.citations }),
      },
    });

    return NextResponse.json({
      ok: true,
      answer: ragResult.answer,
      citations: ragResult.citations,
      message: assistantMsg,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!kb || kb.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Knowledge Base not found.');
    }

    if (fileId) {
      await prisma.knowledgeBaseFile.delete({ where: { id: fileId } });
      return NextResponse.json({ ok: true });
    }

    await prisma.knowledgeBase.delete({ where: { id: kb.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
