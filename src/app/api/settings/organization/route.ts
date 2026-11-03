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
    if (!user.organizationId || !user.organization) {
      return NextResponse.json({ ok: true, organization: null });
    }
    let meta = {};
    try {
      meta = JSON.parse(user.organization.meta || '{}');
    } catch {
      meta = {};
    }
    return NextResponse.json({
      ok: true,
      organization: {
        ...user.organization,
        parsedMeta: meta,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId || !user.organization) {
      throw new HttpError(404, 'Organization not found.');
    }

    const body = await parseJsonBody<{
      name?: string;
      description?: string;
      website?: string;
      meta?: Record<string, unknown>;
    }>(request);

    let currentMeta: Record<string, unknown> = {};
    try {
      currentMeta = JSON.parse(user.organization.meta || '{}');
    } catch {
      currentMeta = {};
    }
    const mergedMeta = body.meta
      ? { ...currentMeta, ...body.meta }
      : currentMeta;

    const updated = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name:
          typeof body.name === 'string' && body.name.trim()
            ? body.name.trim()
            : user.organization.name,
        description:
          typeof body.description === 'string'
            ? body.description.trim()
            : user.organization.description,
        website:
          typeof body.website === 'string'
            ? body.website.trim()
            : user.organization.website,
        meta: JSON.stringify(mergedMeta),
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'organization.updated',
      targetType: 'Organization',
      targetId: updated.id,
      summary: `Updated organization settings for ${updated.name}`,
    });

    return NextResponse.json({
      ok: true,
      organization: {
        ...updated,
        parsedMeta: mergedMeta,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
