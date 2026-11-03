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
    if (!user.organizationId) {
      return NextResponse.json({ ok: true, integrations: [] });
    }
    const integrations = await prisma.integrationConnection.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { provider: 'asc' },
    });
    return NextResponse.json({ ok: true, integrations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId) {
      throw new HttpError(400, 'No organization bound to user.');
    }

    const body = await parseJsonBody<{
      provider?: string;
      status?: string;
      config?: Record<string, unknown>;
    }>(request);

    const provider = (body.provider || '').trim().toUpperCase();
    if (!provider) {
      throw new HttpError(400, 'provider is required.');
    }

    const status =
      body.status === 'DISCONNECTED' ? 'DISCONNECTED' : 'CONNECTED';

    const connection = await prisma.integrationConnection.upsert({
      where: {
        organizationId_provider: {
          organizationId: user.organizationId,
          provider,
        },
      },
      create: {
        organizationId: user.organizationId,
        provider,
        status,
        configJson: JSON.stringify(body.config || {}),
        connectedById: user.id,
      },
      update: {
        status,
        configJson: JSON.stringify(body.config || {}),
        connectedById: user.id,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: `integration.${status.toLowerCase()}`,
      targetType: 'IntegrationConnection',
      targetId: connection.id,
      summary: `${status === 'CONNECTED' ? 'Connected' : 'Disconnected'} ${provider} integration`,
      metadata: { provider, status },
    });

    return NextResponse.json({ ok: true, integration: connection });
  } catch (error) {
    return handleApiError(error);
  }
}
