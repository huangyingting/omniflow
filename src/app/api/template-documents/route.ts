import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import {
  OFFICIAL_DOCUMENT_TEMPLATES,
  PRODUCT_SHOWCASE_TEMPLATES,
} from '@/lib/omniflow/catalog';
import { ensureSystemCatalog } from '@/lib/omniflow/service';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.organizationId) {
      await ensureSystemCatalog(user.organizationId);
    }

    const customTemplates = user.organizationId
      ? await prisma.templateDocument.findMany({
          where: {
            OR: [
              { organizationId: user.organizationId },
              { access: 'PUBLIC' },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const mappedCustom = customTemplates.map((tpl) => ({
      ...tpl,
      promptText: tpl.promptInstructions,
      content: tpl.sampleOutput,
    }));

    return NextResponse.json({
      ok: true,
      productTemplates: PRODUCT_SHOWCASE_TEMPLATES,
      officialDocumentTemplates: OFFICIAL_DOCUMENT_TEMPLATES,
      documentTemplates: mappedCustom,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId) {
      throw new HttpError(400, 'Organization is required.');
    }

    const body = await parseJsonBody<{
      name?: string;
      description?: string;
      type?: string;
      category?: string;
      promptText?: string;
      content?: string;
    }>(request);

    const name = (body.name || '').trim();
    if (!name) {
      throw new HttpError(400, 'Template name is required.');
    }

    const template = await prisma.templateDocument.create({
      data: {
        name,
        description: (body.description || '').trim(),
        type: body.type || 'PRD',
        category: body.category || 'Engineering',
        access: 'ORGANIZATION',
        promptInstructions:
          body.promptText?.trim() ||
          `Generate a comprehensive ${body.type || 'PRD'} following the "${name}" template structure.`,
        sampleOutput:
          body.content?.trim() ||
          `# ${name}\n\n## 1. Objective\n\n## 2. Requirements & Acceptance Criteria\n\n## 3. Architecture & Risks\n`,
        organizationId: user.organizationId,
        creatorUserId: user.id,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        template: {
          ...template,
          promptText: template.promptInstructions,
          content: template.sampleOutput,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
