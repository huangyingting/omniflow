import { Prisma, type AccountInvitation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { AccountAdmissionError } from './errors';
import {
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeUserRole,
  type UserRole,
} from './policy';
import { createOpaqueToken, hashOpaqueToken } from './tokens';

const DEFAULT_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CreateAccountInvitationInput = {
  email: string;
  role?: string | null;
  specialty?: string | null;
  organizationId?: string | null;
  invitedById?: string | null;
  invitedByEmail?: string | null;
  expiresAt?: Date;
  expiresInDays?: number;
};

export type AccountInvitationGrant = {
  invitation: AccountInvitation;
  token: string;
  delivery: { queued: boolean; reason?: string };
};

export type PublicInvitationView = {
  id: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'invalid';
  maskedEmail: string | null;
  email?: string;
  role?: UserRole;
  specialty?: string;
  organizationName?: string | null;
  expiresAt: Date | null;
};

function invitationExpiry(
  now: Date,
  requested?: Date,
  expiresInDays?: number
): Date {
  let expiresAt = requested;
  if (!expiresAt && expiresInDays && Number.isFinite(expiresInDays)) {
    const clampedDays = Math.min(30, Math.max(1, Math.round(expiresInDays)));
    expiresAt = new Date(now.getTime() + clampedDays * 86_400_000);
  }
  if (!expiresAt) {
    expiresAt = new Date(now.getTime() + DEFAULT_INVITATION_TTL_MS);
  }
  if (
    !Number.isFinite(expiresAt.getTime()) ||
    expiresAt.getTime() <= now.getTime() ||
    expiresAt.getTime() > now.getTime() + 31 * 86_400_000
  ) {
    throw new AccountAdmissionError(
      400,
      'invalid_expiry',
      'Invitation expiry must be within the next 30 days.'
    );
  }
  return expiresAt;
}

export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

function isUniqueConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export async function expirePendingInvitations(now = new Date()): Promise<number> {
  const result = await prisma.accountInvitation.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: now },
    },
    data: {
      status: 'EXPIRED',
      activeForEmail: null,
      tokenHash: null,
    },
  });
  return result.count;
}

export async function createAccountInvitation(
  input: CreateAccountInvitationInput
): Promise<AccountInvitationGrant> {
  const normalizedEmail = normalizeAccountEmail(input.email);
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(
      400,
      'invalid_email',
      'Enter a valid email address.'
    );
  }

  const role = normalizeUserRole(input.role);
  const specialty = input.specialty?.trim() || 'Product Manager';
  const token = createOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const now = new Date();
  const expiresAt = invitationExpiry(now, input.expiresAt, input.expiresInDays);

  try {
    await prisma.accountInvitation.updateMany({
      where: {
        activeForEmail: normalizedEmail,
        status: 'PENDING',
        expiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
        tokenHash: null,
      },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new AccountAdmissionError(
        409,
        'already_member',
        'An OmniFlow account already exists for this email.'
      );
    }

    const active = await prisma.accountInvitation.findUnique({
      where: { activeForEmail: normalizedEmail },
      select: { id: true },
    });
    if (active) {
      throw new AccountAdmissionError(
        409,
        'invitation_exists',
        'An active invitation already exists for this email.'
      );
    }

    const invitation = await prisma.accountInvitation.create({
      data: {
        email: input.email.trim(),
        normalizedEmail,
        activeForEmail: normalizedEmail,
        role,
        specialty,
        tokenHash,
        organizationId: input.organizationId || null,
        invitedById: input.invitedById || null,
        expiresAt,
      },
    });

    await recordAuditLog({
      actorId: input.invitedById || null,
      actorEmail: input.invitedByEmail || null,
      action: 'account_invitation.create',
      targetType: 'AccountInvitation',
      targetId: invitation.id,
      summary: `Created single-use ${role} invitation for ${normalizedEmail}`,
      metadata: {
        email: normalizedEmail,
        role,
        specialty,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      invitation,
      token,
      delivery: {
        queued: false,
        reason: 'Share this one-time invitation link directly with the recipient.',
      },
    };
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new AccountAdmissionError(
        409,
        'invitation_exists',
        'An active invitation already exists for this email.'
      );
    }
    throw error;
  }
}

export async function inspectAccountInvitation(
  token: string,
  now = new Date()
): Promise<PublicInvitationView> {
  if (!token || !token.trim()) {
    return { id: '', status: 'invalid', maskedEmail: null, expiresAt: null };
  }
  const tokenHash = hashOpaqueToken(token);
  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
    include: {
      organization: { select: { name: true } },
    },
  });

  if (!invitation) {
    return { id: '', status: 'invalid', maskedEmail: null, expiresAt: null };
  }

  if (invitation.status === 'PENDING' && invitation.expiresAt <= now) {
    await prisma.accountInvitation.updateMany({
      where: { id: invitation.id, status: 'PENDING', tokenHash },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
        tokenHash: null,
      },
    });
    return {
      id: invitation.id,
      status: 'expired',
      maskedEmail: maskEmail(invitation.email),
      expiresAt: invitation.expiresAt,
    };
  }

  return {
    id: invitation.id,
    status: invitation.status.toLowerCase() as PublicInvitationView['status'],
    maskedEmail: maskEmail(invitation.email),
    email: invitation.email,
    role: normalizeUserRole(invitation.role),
    specialty: invitation.specialty,
    organizationName: invitation.organization?.name || 'OmniFlow Organization',
    expiresAt: invitation.expiresAt,
  };
}

export async function revokeAccountInvitation(
  id: string,
  actor?: { id?: string | null; email?: string | null }
): Promise<AccountInvitation> {
  const now = new Date();
  const invitation = await prisma.accountInvitation.findUnique({
    where: { id },
  });
  if (!invitation) {
    throw new AccountAdmissionError(404, 'not_found', 'Invitation not found.');
  }
  if (invitation.status === 'REVOKED') {
    return invitation;
  }
  if (invitation.status !== 'PENDING') {
    throw new AccountAdmissionError(
      409,
      'invalid_transition',
      'Only a pending invitation can be revoked.'
    );
  }

  const updated = await prisma.accountInvitation.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedAt: now,
      activeForEmail: null,
      tokenHash: null,
    },
  });

  await recordAuditLog({
    actorId: actor?.id || null,
    actorEmail: actor?.email || null,
    action: 'account_invitation.revoke',
    targetType: 'AccountInvitation',
    targetId: updated.id,
    summary: `Revoked pending invitation for ${updated.normalizedEmail}`,
    metadata: { email: updated.normalizedEmail, role: updated.role },
  });

  return updated;
}

export async function rotateAccountInvitation(
  id: string,
  options?: {
    expiresAt?: Date;
    expiresInDays?: number;
    actorId?: string | null;
    actorEmail?: string | null;
  }
): Promise<AccountInvitationGrant> {
  const token = createOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const now = new Date();
  const nextExpiry = invitationExpiry(now, options?.expiresAt, options?.expiresInDays);

  const invitation = await prisma.accountInvitation.findUnique({
    where: { id },
  });
  if (!invitation) {
    throw new AccountAdmissionError(404, 'not_found', 'Invitation not found.');
  }
  if (invitation.status !== 'PENDING' || invitation.expiresAt <= now) {
    throw new AccountAdmissionError(
      409,
      'invalid_transition',
      'Only a pending invitation can be rotated.'
    );
  }

  const updated = await prisma.accountInvitation.update({
    where: { id },
    data: { tokenHash, expiresAt: nextExpiry },
  });

  await recordAuditLog({
    actorId: options?.actorId || null,
    actorEmail: options?.actorEmail || null,
    action: 'account_invitation.rotate',
    targetType: 'AccountInvitation',
    targetId: updated.id,
    summary: `Rotated single-use invitation token for ${updated.normalizedEmail}`,
    metadata: {
      email: updated.normalizedEmail,
      expiresAt: nextExpiry.toISOString(),
    },
  });

  return {
    invitation: updated,
    token,
    delivery: {
      queued: false,
      reason: 'Share the new invitation link directly. The previous link is now invalid.',
    },
  };
}

export async function listAccountInvitations(organizationId?: string | null) {
  await expirePendingInvitations();
  return prisma.accountInvitation.findMany({
    where: organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      normalizedEmail: true,
      role: true,
      specialty: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      createdAt: true,
      invitedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      acceptedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}
