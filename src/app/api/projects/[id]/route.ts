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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, specialty: true },
        },
        creator: {
          select: { id: true, name: true, email: true, specialty: true },
        },
        documents: {
          orderBy: { createdAt: 'asc' },
          include: {
            incomingSyncs: {
              where: { status: 'PENDING' },
            },
          },
        },
        workPlans: {
          orderBy: { createdAt: 'asc' },
          include: {
            issues: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        issues: {
          orderBy: { createdAt: 'asc' },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            workPlan: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    const members = await prisma.user.findMany({
      where: { organizationId: project.organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, email: true, role: true, specialty: true },
    });

    return NextResponse.json({
      ok: true,
      project: {
        ...project,
        parsedMeta: (() => {
          try {
            return JSON.parse(project.meta || '{}');
          } catch {
            return {};
          }
        })(),
      },
      members,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWriteAccess();
    const { id } = await context.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    const body = await parseJsonBody<{
      name?: string;
      shortName?: string;
      description?: string;
      status?: string;
      access?: string;
      ownerUserId?: string;
      dueDate?: string | null;
      meta?: Record<string, unknown>;
    }>(request);

    let currentMeta: Record<string, unknown> = {};
    try {
      currentMeta = JSON.parse(project.meta || '{}');
    } catch {
      currentMeta = {};
    }
    const mergedMeta = body.meta
      ? { ...currentMeta, ...body.meta }
      : currentMeta;

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        name:
          typeof body.name === 'string' && body.name.trim()
            ? body.name.trim()
            : project.name,
        shortName:
          typeof body.shortName === 'string' && body.shortName.trim()
            ? body.shortName.trim().toUpperCase().slice(0, 8)
            : project.shortName,
        description:
          typeof body.description === 'string'
            ? body.description.trim()
            : project.description,
        status:
          typeof body.status === 'string' ? body.status : project.status,
        access:
          typeof body.access === 'string' ? body.access : project.access,
        ownerUserId:
          typeof body.ownerUserId === 'string'
            ? body.ownerUserId
            : project.ownerUserId,
        dueDate:
          body.dueDate === null
            ? null
            : typeof body.dueDate === 'string' && body.dueDate
            ? new Date(body.dueDate)
            : project.dueDate,
        meta: JSON.stringify(mergedMeta),
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'project.updated',
      targetType: 'Project',
      targetId: updated.id,
      summary: `Updated project "${updated.name}" (${updated.shortName})`,
    });

    return NextResponse.json({ ok: true, project: updated });
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
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    await prisma.project.delete({ where: { id: project.id } });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'project.deleted',
      targetType: 'Project',
      targetId: project.id,
      summary: `Deleted project "${project.name}" (${project.shortName})`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
