import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireWriteAccess,
} from '@/lib/api';
import {
  executeVirtualSql,
  synthesizeProductMeta,
  type ProductMeta,
} from '@/lib/omniflow/ai-engine';

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
      environment?: 'PREVIEW' | 'PRODUCTION';
      action?: 'execute-sql' | 'snapshot' | 'reset';
      query?: string;
    }>(request);

    const envKey =
      body.environment === 'PRODUCTION' ? 'productionDb' : 'previewDb';

    let meta: ProductMeta;
    try {
      const parsed = JSON.parse(document.meta || '{}');
      if (parsed.previewDb && parsed.productionDb) {
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

    if (body.action === 'snapshot') {
      meta[envKey].lastSnapshotAt = new Date().toISOString();
      await prisma.document.update({
        where: { id: document.id },
        data: { meta: JSON.stringify(meta) },
      });
      return NextResponse.json({
        ok: true,
        db: meta[envKey],
        message: `Captured point-in-time snapshot for ${
          body.environment || 'PREVIEW'
        } database.`,
      });
    }

    if (body.action === 'reset') {
      const fresh = synthesizeProductMeta({
        projectName: document.project?.name || document.name,
        shortName: document.project?.shortName || 'OM10',
        prompt: document.description,
      });
      meta[envKey] = fresh[envKey];
      await prisma.document.update({
        where: { id: document.id },
        data: { meta: JSON.stringify(meta) },
      });
      return NextResponse.json({
        ok: true,
        db: meta[envKey],
        message: `Reset ${
          body.environment || 'PREVIEW'
        } database to baseline schema and seed rows.`,
      });
    }

    const sqlQuery = (body.query || '').trim();
    if (!sqlQuery) {
      throw new HttpError(400, 'SQL query is required.');
    }

    const result = executeVirtualSql(meta[envKey], sqlQuery);
    meta[envKey] = result.updatedDb;

    await prisma.document.update({
      where: { id: document.id },
      data: { meta: JSON.stringify(meta) },
    });

    return NextResponse.json({
      ok: true,
      db: meta[envKey],
      columns: result.columns,
      rows: result.rows,
      message: result.message,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
