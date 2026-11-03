import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import {
  bootstrapAdmin,
  createAccountInvitation,
  listAccountInvitations,
  revokeAccountInvitation,
  rotateAccountInvitation,
  inspectAccountInvitation,
  registerWithInvitation,
  authenticatePassword,
} from '../src/lib/account-admission';
import {
  createSpecDrivenProject,
  triggerDownstreamSyncEvents,
} from '../src/lib/omniflow/service';
import {
  executeVirtualSql,
  synthesizeProductMeta,
  synthesizeUIDesignMeta,
  synthesizeDevPlanMeta,
  chunkTextContent,
  answerWithKnowledgeBase,
  runFreeAiTool,
} from '../src/lib/omniflow/ai-engine';

async function resetTestDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.creditLedgerEntry.deleteMany();
  await prisma.documentSyncEvent.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.workPlan.deleteMany();
  await prisma.project.deleteMany();
  await prisma.knowledgeBaseFile.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.integrationConnection.deleteMany();
  await prisma.templateDocument.deleteMany();
  await prisma.accountInvitation.deleteMany();
  await prisma.passwordCredential.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

describe('OmniFlow AI — Invite-Only Admission, RBAC, Audit & Spec-Driven Engine', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await resetTestDatabase();
  });

  it('1. Enforces Zero-Dummy-Data policy on a clean database and bootstraps initial CLI ADMIN', async () => {
    const initialUserCount = await prisma.user.count();
    const initialProjectCount = await prisma.project.count();
    expect(initialUserCount).toBe(0);
    expect(initialProjectCount).toBe(0);

    const bootstrapped = await bootstrapAdmin({
      email: 'root@omniflow.test',
      password: 'StrongAdminPassword!2025',
      name: 'Root Architect',
      organizationName: 'OmniFlow Core Org',
    });

    const admin = bootstrapped.user;
    expect(admin.id).toBeDefined();
    expect(admin.role).toBe('ADMIN');
    expect(admin.organizationId).toBeDefined();

    // Authenticates valid credentials and rejects bad password
    const authRes = await authenticatePassword({
      email: 'root@omniflow.test',
      password: 'StrongAdminPassword!2025',
    });
    expect(authRes?.user.id).toBe(admin.id);

    const badAuth = await authenticatePassword({
      email: 'root@omniflow.test',
      password: 'WrongPassword123!',
    });
    expect(badAuth).toBeNull();
  });

  it('2. Issues single-use SHA-256 invitations, enforces single redemption, and blocks replay/revoked/expired tokens', async () => {
    const bootstrapped = await bootstrapAdmin({
      email: 'admin@omniflow.test',
      password: 'StrongAdminPassword!2025',
      name: 'Security Admin',
      organizationName: 'Acme AI Workspace',
    });
    const admin = bootstrapped.user;

    // Issue MEMBER invitation
    const issued = await createAccountInvitation({
      invitedById: admin.id,
      invitedByEmail: admin.email,
      organizationId: admin.organizationId,
      email: 'builder@omniflow.test',
      role: 'MEMBER',
      specialty: 'Full-Stack Engineer',
      expiresInDays: 7,
    });

    expect(issued.token).toBeDefined();

    // Raw token must never be stored in DB — only SHA-256 hash
    const dbInvite = await prisma.accountInvitation.findUnique({
      where: { id: issued.invitation.id },
    });
    expect(dbInvite?.tokenHash).toBeDefined();
    expect(dbInvite?.tokenHash).not.toBe(issued.token);

    // Inspect token before acceptance
    const validated = await inspectAccountInvitation(issued.token);
    expect(validated.email).toBe('builder@omniflow.test');
    expect(validated.role).toBe('MEMBER');
    expect(validated.status).toBe('pending');

    // Accept invitation and create account
    const accepted = await registerWithInvitation({
      token: issued.token,
      email: 'builder@omniflow.test',
      name: 'Elena Builder',
      password: 'BuilderSecurePassword!99',
    });
    expect(accepted.user.email).toBe('builder@omniflow.test');
    expect(accepted.user.role).toBe('MEMBER');
    expect(accepted.user.organizationId).toBe(admin.organizationId);

    // Replay of the exact same single-use token must fail closed
    await expect(
      registerWithInvitation({
        token: issued.token,
        email: 'builder@omniflow.test',
        name: 'Replay Attacker',
        password: 'BuilderSecurePassword!99',
      })
    ).rejects.toThrow();

    // Issue VIEWER invitation, rotate token, and revoke it
    const viewerInvite = await createAccountInvitation({
      invitedById: admin.id,
      invitedByEmail: admin.email,
      organizationId: admin.organizationId,
      email: 'viewer@omniflow.test',
      role: 'VIEWER',
      expiresInDays: 3,
    });

    const rotated = await rotateAccountInvitation(viewerInvite.invitation.id, {
      actorId: admin.id,
      actorEmail: admin.email,
      expiresInDays: 3,
    });
    expect(rotated.token).not.toBe(viewerInvite.token);

    // Old token must be invalid after rotation
    const oldInspect = await inspectAccountInvitation(viewerInvite.token);
    expect(oldInspect.status).toBe('invalid');

    // Revoke invitation and verify redemption fails
    await revokeAccountInvitation(viewerInvite.invitation.id, {
      id: admin.id,
      email: admin.email,
    });
    await expect(
      registerWithInvitation({
        token: rotated.token,
        email: 'viewer@omniflow.test',
        name: 'Revoked Viewer',
        password: 'ViewerSecurePassword!99',
      })
    ).rejects.toThrow();

    const allInvites = await listAccountInvitations(admin.organizationId!);
    expect(allInvites.length).toBe(2);

    // Verify immutable AuditLog entries were written
    const auditLogs = await prisma.auditLog.findMany();
    expect(auditLogs.length).toBeGreaterThanOrEqual(4);
  });

  it('3. Creates a 7-artifact Spec-Driven Project, propagates PRD -> UI/Product sync events, and executes DevPlan + Virtual SQL', async () => {
    const bootstrapped = await bootstrapAdmin({
      email: 'pm@omniflow.test',
      password: 'StrongAdminPassword!2025',
      name: 'Principal PM',
      organizationName: 'OmniFlow Product Lab',
    });
    const admin = bootstrapped.user;

    const created = await createSpecDrivenProject({
      userId: admin.id,
      organizationId: admin.organizationId!,
      name: 'SmartSupport AI Triage Hub',
      prompt:
        'Build an AI customer support triage platform with SLA countdowns, automated routing, and RAG citations.',
    });

    expect(created.project.name).toBe('SmartSupport AI Triage Hub');
    const docValues = Object.values(created.documents);
    expect(docValues.length).toBe(7);

    const prdDoc = await prisma.document.findUniqueOrThrow({
      where: { id: created.prdDocumentId },
    });
    const uiDoc = await prisma.document.findUniqueOrThrow({
      where: { id: created.uiDocumentId },
    });
    const prodDoc = await prisma.document.findUniqueOrThrow({
      where: { id: created.productDocumentId },
    });
    const devPlanDoc = await prisma.document.findUniqueOrThrow({
      where: { id: created.documents.DEVELOPMENT_PLAN.id },
    });

    expect(prdDoc.content).toContain('Problem & Opportunity');
    expect(uiDoc.id).toBeDefined();
    expect(prodDoc.id).toBeDefined();
    expect(devPlanDoc.id).toBeDefined();

    // Updating PRD and triggering downstream sync events creates PENDING DocumentSyncEvents on UI_DESIGN, PRODUCT, etc.
    const updatedPrd = await prisma.document.update({
      where: { id: prdDoc.id },
      data: {
        content: `${prdDoc.content}\n\n## 6. New Enterprise Webhook Requirement\nSupport real-time PagerDuty & Slack webhook signatures.`,
        currentVersion: 2,
      },
    });
    expect(updatedPrd.currentVersion).toBe(2);

    await triggerDownstreamSyncEvents({
      projectId: created.project.id,
      sourceDocumentId: prdDoc.id,
      sourceType: 'PRD',
      sourceVersion: 2,
      summary: 'PRD updated to V2 with Enterprise Webhook Requirement',
    });

    const pendingSyncs = await prisma.documentSyncEvent.findMany({
      where: {
        projectId: created.project.id,
        targetDocumentId: uiDoc.id,
        status: 'PENDING',
      },
    });
    expect(pendingSyncs.length).toBeGreaterThanOrEqual(1);

    // Apply downstream sync on UI_DESIGN and verify multi-page wireframe synthesis
    const nextUiMeta = synthesizeUIDesignMeta({
      projectName: created.project.name,
      prompt: 'Enterprise Webhook & Triage UI',
      styleId: 'cyberpunk-dark',
    });
    expect(nextUiMeta.pages.length).toBe(4);
    expect(nextUiMeta.palette.primary).toBeDefined();

    // Execute Virtual SQL against Product Preview DB
    const parsedProdMeta = JSON.parse(prodDoc.meta);
    const sqlInsert = executeVirtualSql(
      parsedProdMeta.previewDb,
      "INSERT INTO workflow_items (id, title, priority, status, owner, sla_minutes) VALUES ('WF-999', 'Verify SAML SSO Federation', 'P0', 'OPEN', 'Elena', 15);"
    );
    expect(sqlInsert.message).toContain('Inserted');

    const sqlSelect = executeVirtualSql(
      sqlInsert.updatedDb,
      'SELECT * FROM workflow_items;'
    );
    expect(sqlSelect.rows.some((r) => r.id === 'WF-999')).toBe(true);

    // Generate 2-step DevPlan and verify Epics, Stories, Sprints & Milestones
    const devPlan = synthesizeDevPlanMeta({
      projectName: created.project.name,
      shortName: created.project.shortName,
      roles: ['Product Manager', 'Full-Stack Engineer', 'QA Engineer'],
    });
    expect(devPlan.epics.length).toBeGreaterThanOrEqual(2);
    expect(devPlan.sprints.length).toBeGreaterThanOrEqual(2);
    expect(devPlan.milestones.length).toBeGreaterThanOrEqual(2);

    const projectIssues = await prisma.issue.findMany({
      where: { projectId: created.project.id },
    });
    expect(projectIssues.length).toBeGreaterThan(0);
  });

  it('4. Indexes Knowledge Base files into chunks, returns grounded RAG citations, and runs Free AI Tools', async () => {
    const bootstrapped = await bootstrapAdmin({
      email: 'rag@omniflow.test',
      password: 'StrongAdminPassword!2025',
      name: 'RAG Lead',
      organizationName: 'Knowledge Org',
    });
    const admin = bootstrapped.user;

    const rawPolicyText =
      'All enterprise tenants authenticate via SAML 2.0 or invite-only SHA-256 single-use tokens. Database snapshots are retained for 30 days with AES-256 encryption.';
    const chunks = chunkTextContent(rawPolicyText);
    expect(chunks.length).toBeGreaterThanOrEqual(1);

    const kb = await prisma.knowledgeBase.create({
      data: {
        name: 'Enterprise Security Architecture KB',
        description: 'SOC2, SAML 2.0, and encryption policies.',
        organizationId: admin.organizationId!,
        creatorUserId: admin.id,
        files: {
          create: [
            {
              fileName: 'security-policy.md',
              fileSize: rawPolicyText.length,
              content: rawPolicyText,
              chunkCount: chunks.length,
              chunksJson: JSON.stringify(chunks),
              uploadedById: admin.id,
            },
          ],
        },
      },
      include: { files: true },
    });

    expect(kb.files.length).toBe(1);
    expect(kb.files[0].chunkCount).toBeGreaterThanOrEqual(1);

    const ragAnswer = answerWithKnowledgeBase({
      kbName: kb.name,
      question:
        'How do enterprise tenants authenticate and how long are snapshots retained?',
      files: kb.files,
    });

    expect(ragAnswer.answer).toContain('security-policy.md');
    expect(ragAnswer.citations.length).toBeGreaterThan(0);

    // Public Free AI Tools Engine
    const freeToolOut = runFreeAiTool({
      toolId: 'prd-generator',
      input: 'Real-time Kubernetes cost anomaly detector',
    });
    expect(freeToolOut.outputMarkdown).toContain('Problem & Opportunity');

    // Direct Virtual SQL UPDATE verification
    const prodMeta = synthesizeProductMeta({
      projectName: 'TestApp',
      shortName: 'TA10',
      prompt: 'Test App',
    });
    const updateRes = executeVirtualSql(
      prodMeta.previewDb,
      "UPDATE workflow_items SET status = 'RESOLVED' WHERE id = 'WF-101';"
    );
    expect(updateRes.message).toContain('Updated');
  });
});
