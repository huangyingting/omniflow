import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  currentUser,
  handleApiError,
  parseJsonBody,
  requireUser,
} from '@/lib/api';
import { hashPassword } from '@/lib/account-admission/passwords';
import { recordAuditLog } from '@/lib/account-admission/audit';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }
    const projectCount = user.organizationId
      ? await prisma.project.count({ where: { organizationId: user.organizationId } })
      : 0;
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        department: user.department,
        velocity: user.velocity,
        referralCode: user.referralCode,
        organizationId: user.organizationId,
        organization: user.organization,
        meta: (() => {
          try {
            return JSON.parse(user.meta || '{}');
          } catch {
            return {};
          }
        })(),
        projectCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await parseJsonBody<{
      firstname?: string;
      lastname?: string;
      name?: string;
      specialty?: string;
      department?: string;
      velocity?: number;
      newPassword?: string;
      meta?: Record<string, unknown>;
    }>(request);

    const firstname =
      typeof body.firstname === 'string' ? body.firstname.trim() : user.firstname;
    const lastname =
      typeof body.lastname === 'string' ? body.lastname.trim() : user.lastname;
    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : `${firstname} ${lastname}`.trim() || user.name;
    const specialty =
      typeof body.specialty === 'string' ? body.specialty.trim() : user.specialty;
    const department =
      typeof body.department === 'string' ? body.department.trim() : user.department;
    const velocity =
      typeof body.velocity === 'number' && Number.isFinite(body.velocity)
        ? Math.max(1, Math.min(100, Math.round(body.velocity)))
        : user.velocity;

    let currentMeta: Record<string, unknown> = {};
    try {
      currentMeta = JSON.parse(user.meta || '{}');
    } catch {
      currentMeta = {};
    }
    const mergedMeta = body.meta
      ? { ...currentMeta, ...body.meta }
      : currentMeta;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstname,
        lastname,
        name,
        specialty,
        department,
        velocity,
        meta: JSON.stringify(mergedMeta),
      },
      include: { organization: true },
    });

    if (typeof body.newPassword === 'string' && body.newPassword.trim()) {
      const passwordHash = await hashPassword(body.newPassword);
      await prisma.passwordCredential.upsert({
        where: { userId: user.id },
        create: { userId: user.id, passwordHash },
        update: { passwordHash, passwordChangedAt: new Date() },
      });
      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'user.password_changed',
        targetType: 'User',
        targetId: user.id,
        summary: `Updated account password for ${user.email}`,
      });
    }

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
