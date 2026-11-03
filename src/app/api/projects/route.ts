import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import { createSpecDrivenProject } from '@/lib/omniflow/service';

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!user.organizationId) {
      return NextResponse.json({ ok: true, projects: [], stats: {} });
    }

    const projects = await prisma.project.findMany({
      where: {
        organizationId: user.organizationId,
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { shortName: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true, specialty: true },
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            currentVersion: true,
            url: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        issues: {
          select: {
            id: true,
            name: true,
            shortName: true,
            type: true,
            status: true,
            priority: true,
            storyPoint: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { issues: true, workPlans: true },
        },
      },
    });

    const recentDocuments = await prisma.document.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        project: { select: { id: true, name: true, shortName: true } },
      },
    });

    const myIssues = await prisma.issue.findMany({
      where: {
        project: { organizationId: user.organizationId },
        type: { not: 'BUILDABLE' },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      include: {
        project: { select: { id: true, name: true, shortName: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      projects,
      recentDocuments,
      myIssues,
      organization: user.organization,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId) {
      throw new HttpError(400, 'Your account is not bound to an organization.');
    }

    const body = await parseJsonBody<{
      name?: string;
      prompt?: string;
      description?: string;
      access?: string;
      templateProjectId?: string;
      knowledgeBaseId?: string;
    }>(request);

    const prompt = (body.prompt || body.description || '').trim();
    if (!prompt && !body.name) {
      throw new HttpError(
        400,
        'Enter what you would like to build or a project name.'
      );
    }

    const created = await createSpecDrivenProject({
      name: body.name,
      prompt: prompt || body.name || 'New Spec-Driven Product',
      access: body.access,
      organizationId: user.organizationId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      templateProjectId: body.templateProjectId || null,
      knowledgeBaseId: body.knowledgeBaseId || null,
    });

    return NextResponse.json(
      {
        ok: true,
        project: created.project,
        documents: created.documents,
        prdDocumentId: created.prdDocumentId,
        uiDocumentId: created.uiDocumentId,
        productDocumentId: created.productDocumentId,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
