import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId) {
      return NextResponse.json({ ok: true, ideas: [] });
    }

    const ideas = await prisma.chatSession.findMany({
      where: {
        organizationId: user.organizationId,
        targetEntityType: 'IDEA',
        status: 'ACTIVE',
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ ok: true, ideas });
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
      initialPrompt?: string;
    }>(request);

    const prompt = (body.initialPrompt || '').trim();
    const sessionName =
      (body.name || '').trim() ||
      (prompt ? prompt.slice(0, 48) : 'New Ideation Session');

    const idea = await prisma.chatSession.create({
      data: {
        name: sessionName,
        targetEntityType: 'IDEA',
        targetEntityId: '',
        organizationId: user.organizationId,
        userId: user.id,
      },
    });

    await prisma.chatSession.update({
      where: { id: idea.id },
      data: { targetEntityId: idea.id },
    });

    const welcomeMessage = prompt
      ? `Great starting point! Let's brainstorm around **"${prompt}"**:\n\n### 1. Core Value Proposition\n- Eliminates manual coordination bottlenecks with AI-guided specification and automation.\n- Provides measurable time-to-value within the first 5 minutes of onboarding.\n\n### 2. Recommended MVP Feature Set\n1. **Guided Onboarding & Ingestion**: Capture user intent and domain context.\n2. **Interactive AI Synthesis Workspace**: Real-time preview and refinement.\n3. **Export & Downstream Sync**: One-click conversion into a full OmniFlow PRD & Product.\n\nWould you like to convert this ideation thread into a **Living PRD & Full-Stack Project** now, or explore pricing/competitor positioning first?`
      : `Hi ${
          user.name || 'there'
        }! I'm **Joy**, your AI Product Discovery partner. Share a rough idea, market problem, or feature hypothesis, and we'll shape it into a structured product concept ready for one-click PRD generation.`;

    if (prompt) {
      await prisma.chatMessage.create({
        data: {
          chatSessionId: idea.id,
          role: 'user',
          content: prompt,
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        chatSessionId: idea.id,
        role: 'assistant',
        content: welcomeMessage,
      },
    });

    return NextResponse.json({ ok: true, idea }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
