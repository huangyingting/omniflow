import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';

async function recalculateProjectProgress(projectId: string) {
  const issues = await prisma.issue.findMany({
    where: { projectId, type: { not: 'BUILDABLE' } },
  });
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoint || 0), 0);
  const completedPoints = issues
    .filter((i) => i.status === 'COMPLETED' || i.status === 'DONE')
    .reduce((sum, i) => sum + (i.storyPoint || 0), 0);
  const progress =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      storyPoint: totalPoints,
      completedStoryPoint: completedPoints,
      progress,
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    const issues = await prisma.issue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        workPlan: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ ok: true, issues });
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
    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { _count: { select: { issues: true } } },
    });
    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    const body = await parseJsonBody<{
      action?: 'update';
      issueId?: string;
      entityKind?: 'ISSUE' | 'WORKPLAN';
      name?: string;
      description?: string;
      type?: string;
      status?: string;
      priority?: string;
      storyPoint?: number;
      workPlanId?: string;
      ownerUserId?: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
    }>(request);

    if (body.action === 'update' && body.issueId) {
      const existing = await prisma.issue.findUnique({
        where: { id: body.issueId },
      });
      if (!existing || existing.projectId !== project.id) {
        throw new HttpError(404, 'Issue not found.');
      }
      const nextStatus = body.status || existing.status;
      const updated = await prisma.issue.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          completedStoryPoint:
            nextStatus === 'COMPLETED' ? existing.storyPoint : 0,
          progress:
            nextStatus === 'COMPLETED'
              ? 100
              : nextStatus === 'IN_PROGRESS'
              ? 50
              : 0,
        },
      });
      await recalculateProjectProgress(project.id);
      return NextResponse.json({ ok: true, issue: updated });
    }

    if (!body.name || !body.name.trim()) {
      throw new HttpError(400, 'Name is required.');
    }

    if (body.entityKind === 'WORKPLAN') {
      const wpType =
        body.type === 'MILESTONE' || body.type === 'SPRINT'
          ? body.type
          : 'SPRINT';
      const workPlan = await prisma.workPlan.create({
        data: {
          name: body.name.trim(),
          description: body.description?.trim() || '',
          type: wpType,
          status: body.status || 'IN_PROGRESS',
          storyPoint: Number(body.storyPoint || 10),
          plannedStartDate: body.plannedStartDate
            ? new Date(body.plannedStartDate)
            : new Date(),
          plannedEndDate: body.plannedEndDate
            ? new Date(body.plannedEndDate)
            : new Date(Date.now() + 14 * 86_400_000),
          projectId: project.id,
          ownerUserId: body.ownerUserId || user.id,
        },
      });
      return NextResponse.json({ ok: true, workPlan }, { status: 201 });
    }

    const nextIndex = project._count.issues + 1;
    const storyPoints = Math.max(1, Number(body.storyPoint || 3));
    const status = body.status || 'TODO';

    const issue = await prisma.issue.create({
      data: {
        name: body.name.trim(),
        shortName: `${project.shortName}-${nextIndex}`,
        description: body.description?.trim() || '',
        type: body.type || 'STORY',
        status,
        priority: body.priority || 'MEDIUM',
        storyPoint: storyPoints,
        completedStoryPoint: status === 'COMPLETED' ? storyPoints : 0,
        progress: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
        projectId: project.id,
        workPlanId: body.workPlanId || null,
        creatorUserId: user.id,
        ownerUserId: body.ownerUserId || user.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        workPlan: { select: { id: true, name: true, type: true } },
      },
    });

    await recalculateProjectProgress(project.id);
    return NextResponse.json({ ok: true, issue }, { status: 201 });
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
    const { id: projectId } = await context.params;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }

    const body = await parseJsonBody<{
      issueId?: string;
      workPlanId?: string;
      name?: string;
      description?: string;
      status?: string;
      priority?: string;
      storyPoint?: number;
      ownerUserId?: string;
      targetWorkPlanId?: string | null;
    }>(request);

    if (body.workPlanId && !body.issueId) {
      const wp = await prisma.workPlan.update({
        where: { id: body.workPlanId },
        data: {
          name: body.name?.trim(),
          description: body.description?.trim(),
          status: body.status,
          progress:
            body.status === 'COMPLETED'
              ? 100
              : body.status === 'IN_PROGRESS'
              ? 50
              : 0,
        },
      });
      return NextResponse.json({ ok: true, workPlan: wp });
    }

    if (!body.issueId) {
      throw new HttpError(400, 'issueId is required.');
    }

    const existing = await prisma.issue.findUnique({
      where: { id: body.issueId },
    });
    if (!existing || existing.projectId !== project.id) {
      throw new HttpError(404, 'Issue not found.');
    }

    const nextStatus = body.status || existing.status;
    const nextPoints =
      typeof body.storyPoint === 'number'
        ? Math.max(0, body.storyPoint)
        : existing.storyPoint;

    const updated = await prisma.issue.update({
      where: { id: existing.id },
      data: {
        name: body.name?.trim() || existing.name,
        description:
          typeof body.description === 'string'
            ? body.description.trim()
            : existing.description,
        status: nextStatus,
        priority: body.priority || existing.priority,
        storyPoint: nextPoints,
        completedStoryPoint: nextStatus === 'COMPLETED' ? nextPoints : 0,
        progress:
          nextStatus === 'COMPLETED'
            ? 100
            : nextStatus === 'IN_PROGRESS' || nextStatus === 'IN_REVIEW'
            ? 50
            : 0,
        ownerUserId: body.ownerUserId || existing.ownerUserId,
        workPlanId:
          body.targetWorkPlanId !== undefined
            ? body.targetWorkPlanId
            : existing.workPlanId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        workPlan: { select: { id: true, name: true, type: true } },
      },
    });

    await recalculateProjectProgress(project.id);
    return NextResponse.json({ ok: true, issue: updated });
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
    const { id: projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.organizationId !== user.organizationId) {
      throw new HttpError(404, 'Project not found.');
    }
    if (!issueId) {
      throw new HttpError(400, 'issueId query parameter is required.');
    }

    await prisma.issue.delete({ where: { id: issueId } });
    await recalculateProjectProgress(project.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
