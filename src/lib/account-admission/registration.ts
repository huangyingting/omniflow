import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { AccountAdmissionError } from './errors';
import { hashPassword } from './passwords';
import {
  accountAdmissionMode,
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeUserRole,
} from './policy';
import { createDatabaseSession } from './session';
import { hashOpaqueToken } from './tokens';

export type RegistrationInput = {
  email: string;
  password: string;
  name?: string | null;
  specialty?: string | null;
};

export type InvitationRegistrationInput = RegistrationInput & {
  token: string;
};

function normalizedName(name: string | null | undefined, email: string): string {
  const value = name?.trim();
  if (value) return value.slice(0, 120);
  return email.split('@')[0] || 'OmniFlow Builder';
}

function registrationEmail(email: string): string {
  if (!isValidAccountEmail(email)) {
    throw new AccountAdmissionError(
      400,
      'invalid_email',
      'Enter a valid email address.'
    );
  }
  return normalizeAccountEmail(email);
}

export async function registerWithInvitation(
  input: InvitationRegistrationInput
) {
  if (accountAdmissionMode() !== 'invitation-only') {
    throw new AccountAdmissionError(
      409,
      'mode_mismatch',
      'Invitation registration is not enabled.'
    );
  }

  if (!input.token || !input.token.trim()) {
    throw new AccountAdmissionError(
      403,
      'ACCOUNT_INVITATION_REQUIRED',
      'OmniFlow AI requires a valid single-use invitation code to register.'
    );
  }

  const normalizedEmail = registrationEmail(input.email);
  const tokenHash = hashOpaqueToken(input.token);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
  });
  if (!invitation) {
    throw new AccountAdmissionError(
      404,
      'invalid_invitation',
      'This invitation code is invalid or has already been used.'
    );
  }
  if (invitation.status === 'REVOKED' || invitation.revokedAt) {
    throw new AccountAdmissionError(
      410,
      'invitation_revoked',
      'This invitation has been revoked by an administrator.'
    );
  }
  if (invitation.status === 'ACCEPTED' || invitation.acceptedAt) {
    throw new AccountAdmissionError(
      409,
      'invitation_used',
      'This single-use invitation has already been redeemed.'
    );
  }
  if (invitation.status !== 'PENDING') {
    throw new AccountAdmissionError(
      410,
      'invalid_invitation',
      'This invitation is no longer active.'
    );
  }

  if (invitation.expiresAt <= now) {
    await prisma.accountInvitation.updateMany({
      where: {
        id: invitation.id,
        tokenHash,
        status: 'PENDING',
        expiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
        tokenHash: null,
      },
    });
    throw new AccountAdmissionError(
      410,
      'expired',
      'This invitation has expired.'
    );
  }

  if (invitation.normalizedEmail !== normalizedEmail) {
    throw new AccountAdmissionError(
      403,
      'email_mismatch',
      'The email entered does not match the invited email address.'
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    throw new AccountAdmissionError(
      409,
      'already_member',
      'An account already exists for this email address.'
    );
  }

  const displayName = normalizedName(input.name, normalizedEmail);
  const nameParts = displayName.split(/\s+/);
  const firstname = nameParts[0] || displayName;
  const lastname = nameParts.slice(1).join(' ') || '';
  const username = normalizedEmail.split('@')[0] || 'member';
  const assignedRole = normalizeUserRole(invitation.role);
  const specialty = input.specialty?.trim() || invitation.specialty || 'Product Manager';

  const user = await prisma.$transaction(async (tx) => {
    const claimed = await tx.accountInvitation.updateMany({
      where: {
        id: invitation.id,
        status: 'PENDING',
        tokenHash,
        expiresAt: { gt: now },
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: now,
        activeForEmail: null,
        tokenHash: null,
      },
    });
    if (!claimed.count) {
      throw new AccountAdmissionError(
        410,
        'invalid_invitation',
        'This invitation is no longer active.'
      );
    }

    let organizationId = invitation.organizationId;
    if (!organizationId) {
      const firstOrg = await tx.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (firstOrg) {
        organizationId = firstOrg.id;
      } else {
        const createdOrg = await tx.organization.create({
          data: {
            name: `${displayName}'s Organization`,
            description: 'Spec-Driven AI Product Development Organization',
            status: 'ACTIVE',
            subscriptionTier: 'FREE',
            subscriptionStatus: 'ACTIVE',
            credits: 2000,
          },
        });
        organizationId = createdOrg.id;
      }
    }

    const created = await tx.user.create({
      data: {
        email: normalizedEmail,
        emailVerified: now,
        name: displayName,
        firstname,
        lastname,
        username,
        role: assignedRole,
        specialty,
        status: 'ACTIVE',
        organizationId,
        passwordCredential: {
          create: { passwordHash, passwordChangedAt: now },
        },
      },
    });

    await tx.accountInvitation.update({
      where: { id: invitation.id },
      data: { acceptedById: created.id },
    });

    return created;
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: 'account_invitation.accept',
    targetType: 'AccountInvitation',
    targetId: invitation.id,
    summary: `Accepted invitation and registered ${user.email} with role ${user.role}`,
    metadata: {
      invitationId: invitation.id,
      userId: user.id,
      role: user.role,
      specialty: user.specialty,
    },
  });

  const session = await createDatabaseSession(user.id, now);
  return { user, session };
}
