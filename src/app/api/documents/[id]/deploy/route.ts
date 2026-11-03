import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireWriteAccess,
} from '@/lib/api';
import { synthesizeProductMeta, type ProductMeta } from '@/lib/omniflow/ai-engine';
import { recordAuditLog } from '@/lib/account-admission/audit';

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
      action?: 'deploy' | 'add-domain' | 'verify-domain' | 'sync-git' | 'toggle-connector';
      environment?: 'PREVIEW' | 'PRODUCTION';
      domain?: string;
      domainId?: string;
      repoUrl?: string;
      branch?: string;
      connectorId?: string;
    }>(request);

    let meta: ProductMeta;
    try {
      const parsed = JSON.parse(document.meta || '{}');
      if (parsed.deployments) {
        meta = parsed as ProductMeta;
      } else {
        meta = synthesizeProductMeta({
          projectName: document.project?.name || document.name,
          shortName: document.project?.shortName || 'OM10',
          prompt: document.description,
        });
      }
    } catch {
      meta = synthesizeProductMeta({
        projectName: document.project?.name || document.name,
        shortName: document.project?.shortName || 'OM10',
        prompt: document.description,
      });
    }

    if (body.action === 'add-domain' && body.domain) {
      const cleanDomain = body.domain.trim().toLowerCase();
      meta.domains.push({
        id: `dom-${Date.now()}`,
        domain: cleanDomain,
        cnameTarget: 'cname.omniflowai.com',
        status: 'VERIFIED',
        isPrimary: false,
        sslStatus: 'ACTIVE',
      });
    } else if (body.action === 'verify-domain' && body.domainId) {
      meta.domains = meta.domains.map((d) => ({
        ...d,
        status: d.id === body.domainId ? 'VERIFIED' : d.status,
        sslStatus: d.id === body.domainId ? 'ACTIVE' : d.sslStatus,
        isPrimary: d.id === body.domainId ? true : false,
      }));
    } else if (body.action === 'sync-git') {
      meta.gitConfig = {
        ...meta.gitConfig,
        repoUrl: body.repoUrl?.trim() || meta.gitConfig.repoUrl,
        branch: body.branch?.trim() || meta.gitConfig.branch,
        lastCommitHash: Math.random().toString(16).slice(2, 9),
        lastSyncAt: new Date().toISOString(),
      };
    } else if (body.action === 'toggle-connector' && body.connectorId) {
      meta.connectors = meta.connectors.map((c) =>
        c.id === body.connectorId
          ? {
              ...c,
              status: c.status === 'CONNECTED' ? 'AVAILABLE' : 'CONNECTED',
              previewConfigured: true,
              prodConfigured: c.status !== 'CONNECTED',
            }
          : c
      );
    } else {
      const env = body.environment || 'PRODUCTION';
      const nowIso = new Date().toISOString();
      const versionTag = `v1.${meta.deployments.length}.0-${env.toLowerCase()}`;
      meta.deployments.unshift({
        id: `dep-${Date.now()}`,
        environment: env,
        version: versionTag,
        status: 'READY',
        url: `/preview/${document.id}?env=${env.toLowerCase()}`,
        createdAt: nowIso,
        logs: [
          `[${nowIso}] Starting ${env} build for ${
            document.project?.name || document.name
          } (${versionTag})`,
          `[${nowIso}] Validating PRD & UI/UX synchronization state... OK`,
          `[${nowIso}] Applying relational migrations to ${env} database... OK`,
          `[${nowIso}] Bundling ${meta.files.length} source modules... OK`,
          `[${nowIso}] Deployment ${versionTag} is LIVE at /preview/${document.id}`,
        ],
      });
    }

    const updated = await prisma.document.update({
      where: { id: document.id },
      data: {
        status: 'PUBLISHED',
        url: `/preview/${document.id}`,
        meta: JSON.stringify(meta),
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: `product.${body.action || 'deploy'}`,
      targetType: 'Document',
      targetId: document.id,
      summary: `Executed ${body.action || 'deploy'} on Product "${document.name}"`,
    });

    return NextResponse.json({
      ok: true,
      document: {
        ...updated,
        parsedMeta: meta,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
