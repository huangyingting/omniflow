import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireAdmin,
  requireUser,
} from '@/lib/api';
import { normalizeUserRole } from '@/lib/account-admission/policy';
import { recordAuditLog } from '@/lib/account-admission/audit';

export async function GET() {
  try {
    const user = await requireUser();
    const users = await prisma.user.findMany({
      where: user.organizationId
        ? { organizationId: user.organizationId }
        : undefined,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        role: true,
        specialty: true,
        department: true,
        velocity: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      ok: true,
      users,
      organization: user.organization,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await parseJsonBody<{
      userId?: string;
      role?: string;
      specialty?: string;
      velocity?: number;
      status?: string;
    }>(request);

    if (!body.userId) {
      throw new HttpError(400, 'userId is required.');
    }

    const target = await prisma.user.findUnique({
      where: { id: body.userId },
    });
    if (!target) {
      throw new HttpError(404, 'User not found.');
    }

    const nextRole = body.role ? normalizeUserRole(body.role) : target.role;
    const nextStatus =
      body.status === 'DISABLED' || body.status === 'ACTIVE'
        ? body.status
        : target.status;

    if (
      target.role === 'ADMIN' &&
      (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE')
    ) {
      const activeAdmins = await prisma.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE' },
      });
      if (activeAdmins <= 1) {
        throw new HttpError(
          409,
          'Cannot demote or disable the last active Administrator.',
          'last_admin'
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        role: nextRole,
        status: nextStatus,
        specialty:
          typeof body.specialty === 'string'
            ? body.specialty.trim()
            : target.specialty,
        velocity:
          typeof body.velocity === 'number' && Number.isFinite(body.velocity)
            ? Math.max(1, Math.min(100, Math.round(body.velocity)))
            : target.velocity,
      },
    });

    if (nextStatus !== 'ACTIVE') {
      await prisma.session.deleteMany({ where: { userId: target.id } });
    }

    await recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action:
        nextStatus !== target.status
          ? `user.status_${nextStatus.toLowerCase()}`
          : 'user.role_updated',
      targetType: 'User',
      targetId: target.id,
      summary: `Updated user ${target.email} (role: ${target.role} -> ${nextRole}, status: ${target.status} -> ${nextStatus})`,
      metadata: {
        previousRole: target.role,
        nextRole,
        previousStatus: target.status,
        nextStatus,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
