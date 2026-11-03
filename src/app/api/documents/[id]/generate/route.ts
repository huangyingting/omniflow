import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireWriteAccess,
} from '@/lib/api';
import {
  synthesizeDevPlanMeta,
  synthesizePRDContent,
  synthesizeProductMeta,
  synthesizeSupportingDocContent,
  synthesizeUIDesignMeta,
  type UIDesignMeta,
} from '@/lib/omniflow/ai-engine';
import { triggerDownstreamSyncEvents } from '@/lib/omniflow/service';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!document || document.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Document not found.');
    }

    const body = await parseJsonBody<{
      prompt?: string;
      styleId?: UIDesignMeta['styleId'];
      roles?: string[];
      confirmSchedule?: boolean;
      knowledgeBaseId?: string;
    }>(request);

    const instruction = (body.prompt || '').trim();
    const projectName = document.project?.name || document.name;
    const shortName = document.project?.shortName || 'OM10';

    let currentMeta: Record<string, unknown> = {};
    try {
      currentMeta = JSON.parse(document.meta || '{}');
    } catch {
      currentMeta = {};
    }

    let nextContent = document.content;
    let nextMeta: Record<string, unknown> = { ...currentMeta };
    let assistantReply = '';

    let knowledgeContext = '';
    if (body.knowledgeBaseId) {
      const kb = await prisma.knowledgeBase.findUnique({
        where: { id: body.knowledgeBaseId },
        include: { files: true },
      });
      if (kb && kb.files.length > 0) {
        knowledgeContext = kb.files
          .map((f) => `- **${f.fileName}**: ${f.content.slice(0, 300)}`)
          .join('\n');
      }
    }

    const nextVersion = document.currentVersion + 1;

    if (document.type === 'PRD') {
      const prdSynth = synthesizePRDContent({
        projectName,
        prompt: document.description || projectName,
        authorName: user.name || user.email,
        knowledgeContext,
        refinementInstruction:
          instruction || 'Expand acceptance criteria and technical edge cases.',
      });
      nextContent = prdSynth.content;
      nextMeta = {
        ...currentMeta,
        followUpSuggestions: prdSynth.followUpSuggestions,
        lastRefinedAt: new Date().toISOString(),
      };
      assistantReply = `I've updated the Living PRD to **V${nextVersion}** incorporating: *"${
        instruction || 'Expanded specification & acceptance criteria'
      }"*. Downstream UI/UX Design and Product workspaces have been notified of this spec update.`;
    } else if (document.type === 'UI_DESIGN') {
      const styleId =
        body.styleId ||
        (currentMeta.styleId as UIDesignMeta['styleId']) ||
        'modern-minimal';
      const uiSynth = synthesizeUIDesignMeta({
        projectName,
        prompt: instruction || document.description || projectName,
        styleId,
      });
      nextMeta = uiSynth as unknown as Record<string, unknown>;
      assistantReply = `Generated multi-page UI/UX wireframes (**V${nextVersion}**) using the **${uiSynth.styleName}** design system across 4 interactive screens. Switch between Desktop, Tablet, and Mobile viewports or click **Make Product** to build the full-stack application.`;
    } else if (document.type === 'PRODUCT') {
      const prodSynth = synthesizeProductMeta({
        projectName,
        shortName,
        prompt: instruction || document.description || projectName,
      });
      if (instruction) {
        prodSynth.heroSubtitle = `${document.description} — Updated: ${instruction}`;
      }
      nextMeta = prodSynth as unknown as Record<string, unknown>;
      assistantReply = `Built **V${nextVersion}** of the full-stack application for **${projectName}**. Live Preview, Code Editor, Preview/Production SQL Databases, and Connectors are ready.`;
    } else if (document.type === 'DEVELOPMENT_PLAN') {
      const roles =
        Array.isArray(body.roles) && body.roles.length > 0
          ? body.roles
          : (currentMeta.roles as string[]) || [
              'Product Manager',
              'UI/UX Designer',
              'Full-Stack Engineer',
              'QA Engineer',
            ];
      const devSynth = synthesizeDevPlanMeta({
        projectName,
        shortName,
        roles,
      });
      devSynth.scheduleConfirmed = Boolean(body.confirmSchedule);
      nextMeta = devSynth as unknown as Record<string, unknown>;

      if (body.confirmSchedule && document.projectId) {
        // Materialize Epics, Stories, Sprints & Milestones into Project WorkPlans & Issues
        for (const ms of devSynth.milestones) {
          await prisma.workPlan.create({
            data: {
              name: ms.name,
              description: ms.deliverables.join(', '),
              type: 'MILESTONE',
              status: 'IN_PROGRESS',
              storyPoint: 13,
              plannedStartDate: new Date(),
              plannedEndDate: new Date(ms.targetDate),
              projectId: document.projectId,
              ownerUserId: user.id,
            },
          });
        }
        for (const sp of devSynth.sprints) {
          const createdSprint = await prisma.workPlan.create({
            data: {
              name: sp.name,
              description: sp.goal,
              type: 'SPRINT',
              status: 'IN_PROGRESS',
              storyPoint: sp.totalStoryPoints,
              plannedStartDate: new Date(sp.startDate),
              plannedEndDate: new Date(sp.endDate),
              projectId: document.projectId,
              ownerUserId: user.id,
            },
          });
          for (const epic of devSynth.epics) {
            for (const st of epic.stories.filter((s) => s.sprint === sp.name)) {
              await prisma.issue.create({
                data: {
                  name: st.name,
                  shortName: st.id,
                  description: st.acceptanceCriteria.join(' • '),
                  type: 'STORY',
                  status: 'TODO',
                  priority: st.priority,
                  storyPoint: st.storyPoint,
                  projectId: document.projectId,
                  workPlanId: createdSprint.id,
                  creatorUserId: user.id,
                  ownerUserId: user.id,
                },
              });
            }
          }
        }
      }
      assistantReply = body.confirmSchedule
        ? `Confirmed Sprint & Milestone schedule (**V${nextVersion}**) and synchronized Epics, Stories, and Tasks directly to your Project Backlog and Issue Board.`
        : `Generated Epics, User Stories, and Task Breakdown (**V${nextVersion}**) across ${roles.length} engineering roles.`;
    } else {
      const docType =
        document.type === 'QA_PLAN' || document.type === 'RELEASE_PLAN'
          ? document.type
          : 'TECH_DESIGN';
      nextContent =
        synthesizeSupportingDocContent({
          type: docType,
          projectName,
          shortName,
          prompt: instruction || document.description || projectName,
        }) +
        (instruction
          ? `\n\n## Additional Specification Notes\n- ${instruction}\n`
          : '');
      assistantReply = `Generated **V${nextVersion}** of ${document.name}.`;
    }

    const updated = await prisma.document.update({
      where: { id: document.id },
      data: {
        content: nextContent,
        status: 'PUBLISHED',
        currentVersion: nextVersion,
        meta: JSON.stringify(nextMeta),
      },
    });

    if (document.issueId) {
      await prisma.issue.update({
        where: { id: document.issueId },
        data: { status: 'COMPLETED', progress: 100 },
      });
    }

    await prisma.documentVersion.create({
      data: {
        documentId: updated.id,
        versionNumber: nextVersion,
        label: `V${nextVersion} - ${
          instruction ? instruction.slice(0, 36) : 'AI Generation'
        }`,
        content: nextContent,
        metaSnapshot: JSON.stringify(nextMeta),
        createdById: user.id,
      },
    });

    let chatSession = await prisma.chatSession.findFirst({
      where: {
        targetEntityType: 'DOCUMENT',
        targetEntityId: updated.id,
      },
    });
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          name: updated.name,
          targetEntityType: 'DOCUMENT',
          targetEntityId: updated.id,
          organizationId: updated.organizationId,
          userId: user.id,
        },
      });
    }

    if (instruction) {
      await prisma.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: 'user',
          content: instruction,
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'assistant',
        content: assistantReply,
        meta: JSON.stringify({
          version: `V${nextVersion}`,
          stepCompleted: true,
        }),
      },
    });

    if (
      updated.projectId &&
      (updated.type === 'PRD' || updated.type === 'UI_DESIGN')
    ) {
      await triggerDownstreamSyncEvents({
        projectId: updated.projectId,
        sourceDocumentId: updated.id,
        sourceType: updated.type,
        sourceVersion: nextVersion,
        summary: `AI updated ${updated.type} to V${nextVersion}`,
      });
    }

    // Deduct 20 credits
    if (user.organization) {
      const nextCredits = Math.max(0, user.organization.credits - 20);
      await prisma.organization.update({
        where: { id: user.organization.id },
        data: { credits: nextCredits },
      });
      await prisma.creditLedgerEntry.create({
        data: {
          organizationId: user.organization.id,
          userId: user.id,
          amount: -20,
          type: 'DEBITED',
          action: `Joy AI Synthesis (${updated.type} V${nextVersion})`,
          balanceAfter: nextCredits,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      document: {
        ...updated,
        parsedMeta: nextMeta,
      },
      assistantReply,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
