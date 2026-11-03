import { prisma } from '@/lib/prisma';
import { recordAuditLog } from '@/lib/account-admission/audit';
import {
  inferProjectShortName,
  synthesizeDevPlanMeta,
  synthesizePRDContent,
  synthesizeProductMeta,
  synthesizeSupportingDocContent,
  synthesizeUIDesignMeta,
} from './ai-engine';
import {
  OFFICIAL_DOCUMENT_TEMPLATES,
  PRODUCT_SHOWCASE_TEMPLATES,
} from './catalog';

let catalogEnsured = false;

export async function ensureSystemCatalog(_organizationId?: string) {
  if (catalogEnsured) return;
  try {
    for (const docTpl of OFFICIAL_DOCUMENT_TEMPLATES) {
      await prisma.templateDocument.upsert({
        where: { id: docTpl.id },
        create: {
          id: docTpl.id,
          name: docTpl.name,
          description: docTpl.description,
          category: 'DOCUMENT',
          type: docTpl.type,
          access: 'PUBLIC',
          promptInstructions: docTpl.promptInstructions,
          sampleOutput: docTpl.sampleOutput,
          isSystem: true,
        },
        update: {
          name: docTpl.name,
          description: docTpl.description,
          promptInstructions: docTpl.promptInstructions,
          sampleOutput: docTpl.sampleOutput,
          isSystem: true,
        },
      });
    }

    for (const prodTpl of PRODUCT_SHOWCASE_TEMPLATES) {
      await prisma.templateDocument.upsert({
        where: { id: prodTpl.id },
        create: {
          id: prodTpl.id,
          name: prodTpl.name,
          description: prodTpl.description,
          category: 'PRODUCT',
          type: 'PRODUCT',
          access: 'PUBLIC',
          promptInstructions: prodTpl.prompt,
          sampleOutput: prodTpl.tagline,
          previewMeta: JSON.stringify({
            badge: prodTpl.badge,
            accentColor: prodTpl.accentColor,
            highlights: prodTpl.highlights,
            tagline: prodTpl.tagline,
          }),
          isSystem: true,
        },
        update: {
          name: prodTpl.name,
          description: prodTpl.description,
          promptInstructions: prodTpl.prompt,
          previewMeta: JSON.stringify({
            badge: prodTpl.badge,
            accentColor: prodTpl.accentColor,
            highlights: prodTpl.highlights,
            tagline: prodTpl.tagline,
          }),
          isSystem: true,
        },
      });
    }
    catalogEnsured = true;
  } catch (err) {
    console.error('Failed to ensure system catalog:', err);
  }
}

const CANONICAL_DOCUMENT_STAGES = [
  { type: 'PRD', label: 'PRD' },
  { type: 'UI_DESIGN', label: 'UI/UX Design' },
  { type: 'TECH_DESIGN', label: 'Tech Design' },
  { type: 'DEVELOPMENT_PLAN', label: 'Development Plan' },
  { type: 'QA_PLAN', label: 'QA & Test Plan' },
  { type: 'RELEASE_PLAN', label: 'Release Plan' },
  { type: 'PRODUCT', label: 'Product' },
] as const;

export async function createSpecDrivenProject(input: {
  name?: string;
  prompt: string;
  access?: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
  templateProjectId?: string | null;
  knowledgeBaseId?: string | null;
}) {
  const promptText = input.prompt.trim() || 'Build an AI-Powered SaaS Platform';
  const projectName =
    input.name?.trim() ||
    promptText
      .replace(/^(build|create|design|develop|make)\s+(an?|the)?\s*/i, '')
      .split(/\s+with\s+|\s+that\s+|\.|,/i)[0]
      .trim()
      .slice(0, 56) ||
    'SmartSupport Hub';

  const shortName = inferProjectShortName(projectName);
  const access =
    input.access === 'ORGANIZATION' || input.access === 'TEAM'
      ? input.access
      : 'SELF';

  let knowledgeContext = '';
  if (input.knowledgeBaseId) {
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id: input.knowledgeBaseId },
      include: { files: true },
    });
    if (kb && kb.files.length > 0) {
      knowledgeContext = kb.files
        .map((f) => `- **${f.fileName}**: ${f.content.slice(0, 300)}`)
        .join('\n');
    }
  }

  const prdSynth = synthesizePRDContent({
    projectName,
    prompt: promptText,
    authorName: input.userName || input.userEmail,
    knowledgeContext,
  });

  const uiMeta = synthesizeUIDesignMeta({
    projectName,
    prompt: promptText,
    styleId: 'modern-minimal',
  });

  const productMeta = synthesizeProductMeta({
    projectName,
    shortName,
    prompt: promptText,
    uiMeta,
  });

  const devPlanMeta = synthesizeDevPlanMeta({
    projectName,
    shortName,
    roles: ['Product Manager', 'UI/UX Designer', 'Full-Stack Engineer', 'QA Engineer'],
  });

  const techContent = synthesizeSupportingDocContent({
    type: 'TECH_DESIGN',
    projectName,
    shortName,
    prompt: promptText,
  });

  const qaContent = synthesizeSupportingDocContent({
    type: 'QA_PLAN',
    projectName,
    shortName,
    prompt: promptText,
  });

  const releaseContent = synthesizeSupportingDocContent({
    type: 'RELEASE_PLAN',
    projectName,
    shortName,
    prompt: promptText,
  });

  const dueDate = new Date(Date.now() + 28 * 86_400_000);

  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: projectName,
        shortName,
        description: promptText,
        status: 'IN_PROGRESS',
        access,
        storyPoint: 26,
        completedStoryPoint: 5,
        progress: 20,
        dueDate,
        organizationId: input.organizationId,
        creatorUserId: input.userId,
        ownerUserId: input.userId,
        templateProjectId: input.templateProjectId || null,
        meta: JSON.stringify({
          enabledStages: [
            'PRD',
            'UI_DESIGN',
            'PRODUCT',
            'TECH_DESIGN',
            'DEVELOPMENT_PLAN',
            'QA_PLAN',
            'RELEASE_PLAN',
          ],
          activeStyleId: 'modern-minimal',
          knowledgeBaseId: input.knowledgeBaseId || null,
        }),
      },
    });

    const backlog = await tx.workPlan.create({
      data: {
        name: `${projectName}'s Backlog`,
        description: `Primary product backlog for ${projectName}`,
        type: 'BACKLOG',
        status: 'IN_PROGRESS',
        storyPoint: 26,
        completedStoryPoint: 5,
        progress: 20,
        projectId: project.id,
        ownerUserId: input.userId,
      },
    });

    // Also create initial Milestone & Sprint so Project Milestones/Backlog/Board are immediately actionable
    const milestone1 = await tx.workPlan.create({
      data: {
        name: 'Milestone 1: Spec Lock & Interactive Prototype',
        description: 'Complete PRD V1, multi-page UI/UX wireframes, and core data model.',
        type: 'MILESTONE',
        status: 'IN_PROGRESS',
        storyPoint: 13,
        completedStoryPoint: 5,
        progress: 38,
        plannedStartDate: new Date(),
        plannedEndDate: new Date(Date.now() + 14 * 86_400_000),
        projectId: project.id,
        ownerUserId: input.userId,
      },
    });

    const sprint1 = await tx.workPlan.create({
      data: {
        name: 'Sprint 1: Core Architecture & Intake',
        description: 'Deliver core schema, RBAC admission, and triage dashboard.',
        type: 'SPRINT',
        status: 'IN_PROGRESS',
        storyPoint: 13,
        completedStoryPoint: 5,
        progress: 38,
        plannedStartDate: new Date(),
        plannedEndDate: new Date(Date.now() + 14 * 86_400_000),
        projectId: project.id,
        parentWorkPlanId: milestone1.id,
        ownerUserId: input.userId,
      },
    });

    const createdDocs: Record<string, { id: string; type: string; name: string }> = {};

    for (let idx = 0; idx < CANONICAL_DOCUMENT_STAGES.length; idx++) {
      const stage = CANONICAL_DOCUMENT_STAGES[idx];
      const buildableIssue = await tx.issue.create({
        data: {
          name: stage.type,
          shortName: `${shortName}-${idx + 1}`,
          description: `${stage.label} artifact for ${projectName}`,
          type: 'BUILDABLE',
          status: stage.type === 'PRD' ? 'COMPLETED' : 'CREATED',
          priority: 'HIGH',
          storyPoint: 3,
          completedStoryPoint: stage.type === 'PRD' ? 3 : 0,
          progress: stage.type === 'PRD' ? 100 : 0,
          plannedStartDate: new Date(),
          plannedEndDate: dueDate,
          projectId: project.id,
          workPlanId: backlog.id,
          creatorUserId: input.userId,
          ownerUserId: input.userId,
        },
      });

      let docContent = '';
      let docMeta: Record<string, unknown> = {};
      let docUrl = '';

      if (stage.type === 'PRD') {
        docContent = prdSynth.content;
        docMeta = {
          templateName: 'Generic PRD Document',
          followUpSuggestions: prdSynth.followUpSuggestions,
        };
      } else if (stage.type === 'UI_DESIGN') {
        docContent = `Multi-page UI/UX Design wireframe for ${projectName}`;
        docMeta = uiMeta as unknown as Record<string, unknown>;
      } else if (stage.type === 'PRODUCT') {
        docContent = `Full-Stack Application workspace for ${projectName}`;
        docMeta = productMeta as unknown as Record<string, unknown>;
      } else if (stage.type === 'DEVELOPMENT_PLAN') {
        docContent = `Development Plan & Sprint Breakdown for ${projectName}`;
        docMeta = devPlanMeta as unknown as Record<string, unknown>;
      } else if (stage.type === 'TECH_DESIGN') {
        docContent = techContent;
        docMeta = { templateName: 'Generic Technical Design' };
      } else if (stage.type === 'QA_PLAN') {
        docContent = qaContent;
        docMeta = { templateName: 'Generic QA / Test Plan' };
      } else if (stage.type === 'RELEASE_PLAN') {
        docContent = releaseContent;
        docMeta = { templateName: 'Release Note' };
      }

      const doc = await tx.document.create({
        data: {
          name: `${stage.label} - ${projectName}`,
          description: promptText,
          type: stage.type,
          status: stage.type === 'PRD' ? 'PUBLISHED' : 'CREATED',
          access,
          content: docContent,
          currentVersion: 1,
          url: docUrl,
          projectId: project.id,
          issueId: buildableIssue.id,
          organizationId: input.organizationId,
          creatorUserId: input.userId,
          meta: JSON.stringify(docMeta),
        },
      });

      if (stage.type === 'PRODUCT') {
        await tx.document.update({
          where: { id: doc.id },
          data: { url: `/preview/${doc.id}` },
        });
      }

      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          label: 'V1 - Initial Spec Synthesis',
          content: docContent,
          metaSnapshot: JSON.stringify(docMeta),
          createdById: input.userId,
        },
      });

      const chatSession = await tx.chatSession.create({
        data: {
          name: `${stage.label} - ${projectName}`,
          targetEntityType: 'DOCUMENT',
          targetEntityId: doc.id,
          access,
          organizationId: input.organizationId,
          userId: input.userId,
        },
      });

      await tx.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: 'user',
          content: promptText,
        },
      });

      await tx.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: 'assistant',
          content:
            stage.type === 'PRD'
              ? `PRD has been successfully generated and updated (V1). Review the Problem & Opportunity, Personas, KPIs, and Epics on the right, or click **Make Design** to generate your multi-page UI/UX wireframes.`
              : `👋 I'm Joy, your AI assistant. Your ${stage.label} workspace is ready and synchronized with your PRD.`,
          meta: JSON.stringify({
            version: 'V1',
            stepCompleted: true,
            followUpSuggestions: prdSynth.followUpSuggestions,
          }),
        },
      });

      createdDocs[stage.type] = { id: doc.id, type: doc.type, name: doc.name };
    }

    // Seed initial Agile Stories/Tasks into Sprint 1 so Issue Board & Backlog have real project items
    const storyItems = [
      {
        name: 'Lock Living PRD & Acceptance Criteria',
        status: 'COMPLETED',
        priority: 'HIGH',
        points: 5,
      },
      {
        name: 'Generate Multi-Page UI/UX Wireframe & Style Tokens',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        points: 5,
      },
      {
        name: 'Implement Core Relational Schema & Invite-Only RBAC',
        status: 'TODO',
        priority: 'CRITICAL',
        points: 8,
      },
      {
        name: 'Verify Preview & Production SQL Console and Publish App',
        status: 'TODO',
        priority: 'MEDIUM',
        points: 8,
      },
    ];

    for (let i = 0; i < storyItems.length; i++) {
      const s = storyItems[i];
      await tx.issue.create({
        data: {
          name: s.name,
          shortName: `${shortName}-S${i + 1}`,
          description: `${s.name} for ${projectName}`,
          type: 'STORY',
          status: s.status,
          priority: s.priority,
          storyPoint: s.points,
          completedStoryPoint: s.status === 'COMPLETED' ? s.points : 0,
          progress: s.status === 'COMPLETED' ? 100 : s.status === 'IN_PROGRESS' ? 50 : 0,
          plannedStartDate: new Date(),
          plannedEndDate: dueDate,
          projectId: project.id,
          workPlanId: sprint1.id,
          creatorUserId: input.userId,
          ownerUserId: input.userId,
        },
      });
    }

    // Deduct 50 credits for AI project synthesis
    const org = await tx.organization.findUnique({
      where: { id: input.organizationId },
    });
    if (org) {
      const nextCredits = Math.max(0, org.credits - 50);
      await tx.organization.update({
        where: { id: org.id },
        data: {
          credits: nextCredits,
          monthFreeCreditUsed: org.monthFreeCreditUsed + 50,
        },
      });
      await tx.creditLedgerEntry.create({
        data: {
          organizationId: org.id,
          userId: input.userId,
          amount: -50,
          type: 'DEBITED',
          action: `Spec-Driven Project Synthesis: ${projectName}`,
          balanceAfter: nextCredits,
        },
      });
    }

    return {
      project,
      documents: createdDocs,
      prdDocumentId: createdDocs.PRD.id,
      uiDocumentId: createdDocs.UI_DESIGN.id,
      productDocumentId: createdDocs.PRODUCT.id,
    };
  });

  await recordAuditLog({
    actorId: input.userId,
    actorEmail: input.userEmail,
    action: 'project.created',
    targetType: 'Project',
    targetId: result.project.id,
    summary: `Created spec-driven project "${result.project.name}" (${result.project.shortName}) with 7 synchronized artifacts`,
    metadata: {
      shortName: result.project.shortName,
      prdDocumentId: result.prdDocumentId,
    },
  });

  return result;
}

export async function triggerDownstreamSyncEvents(input: {
  projectId: string;
  sourceDocumentId: string;
  sourceType: string;
  sourceVersion: number;
  summary: string;
}) {
  const projectDocs = await prisma.document.findMany({
    where: { projectId: input.projectId },
  });

  const downstreamTypes =
    input.sourceType === 'PRD'
      ? ['UI_DESIGN', 'TECH_DESIGN', 'DEVELOPMENT_PLAN', 'QA_PLAN', 'RELEASE_PLAN', 'PRODUCT']
      : input.sourceType === 'UI_DESIGN'
      ? ['PRODUCT']
      : [];

  const targetDocs = projectDocs.filter(
    (d) => d.id !== input.sourceDocumentId && downstreamTypes.includes(d.type)
  );

  for (const target of targetDocs) {
    await prisma.documentSyncEvent.create({
      data: {
        projectId: input.projectId,
        sourceDocumentId: input.sourceDocumentId,
        targetDocumentId: target.id,
        sourceVersion: input.sourceVersion,
        summary: input.summary,
        status: 'PENDING',
      },
    });
  }
}
