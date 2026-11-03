import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const idea = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!idea || idea.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Ideation session not found.');
    }

    return NextResponse.json({ ok: true, idea });
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

    const idea = await prisma.chatSession.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!idea || idea.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Ideation session not found.');
    }

    const body = await parseJsonBody<{
      message?: string;
      name?: string;
    }>(request);

    if (body.name) {
      const updated = await prisma.chatSession.update({
        where: { id: idea.id },
        data: { name: body.name.trim() },
      });
      return NextResponse.json({ ok: true, idea: updated });
    }

    const userPrompt = (body.message || '').trim();
    if (!userPrompt) {
      throw new HttpError(400, 'Message cannot be empty.');
    }

    await prisma.chatMessage.create({
      data: {
        chatSessionId: idea.id,
        role: 'user',
        content: userPrompt,
      },
    });

    const replyContent = `### Ideation Synthesis: ${userPrompt.slice(0, 60)}

1. **Target Persona & Pain Point**
   - Primary users struggle with fragmented workflows and manual handoffs between product specs, design prototypes, and engineering execution.
   - Addressing "${userPrompt}" directly increases activation and reduces cycle time by 45%.

2. **Proposed User Journey**
   - **Step 1**: User enters high-level objective or uploads domain context.
   - **Step 2**: AI synthesizes structured options with instant visual preview.
   - **Step 3**: Team collaborates, refines acceptance criteria, and publishes to production.

3. **Key Risks & Mitigations**
   - *Risk*: Scope creep in initial release → *Mitigation*: Enforce P0/P1 prioritization in the PRD.
   - *Risk*: Data latency → *Mitigation*: Use indexed relational queries and optimistic UI updates.

Ready to turn this into an executable project? Click **Convert to Project & PRD** in the top bar!`;

    const assistantMsg = await prisma.chatMessage.create({
      data: {
        chatSessionId: idea.id,
        role: 'assistant',
        content: replyContent,
      },
    });

    await prisma.chatSession.update({
      where: { id: idea.id },
      data: {
        name:
          idea.name === 'New Ideation Session'
            ? userPrompt.slice(0, 48)
            : idea.name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: assistantMsg,
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

    const idea = await prisma.chatSession.findUnique({ where: { id } });
    if (!idea || idea.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Ideation session not found.');
    }

    await prisma.chatSession.delete({ where: { id: idea.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
