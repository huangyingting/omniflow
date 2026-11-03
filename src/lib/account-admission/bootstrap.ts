import { prisma } from '@/lib/prisma';
import { AccountAdmissionError } from './errors';
import { hashPassword } from './passwords';
import { isValidAccountEmail, normalizeAccountEmail } from './policy';

/**
 * Provisions or promotes a root Administrator account from the deployment host CLI
 * (`npm run bootstrap:admin -- --email <email> --password-stdin`).
 *
 * Security invariant: Never exposed via an HTTP API endpoint or public web route.
 */
export async function bootstrapAdmin(input: {
  email: string;
  password: string;
  name?: string | null;
  organizationName?: string | null;
}) {
  const email = normalizeAccountEmail(input.email);
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(
      400,
      'invalid_email',
      'Enter a valid administrator email address.'
    );
  }

  if (!input.password || input.password.length < 8 || input.password.length > 128) {
    throw new AccountAdmissionError(
      400,
      'invalid_password',
      'Administrator password must be between 8 and 128 characters.'
    );
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const displayName = input.name?.trim() || email.split('@')[0] || 'Platform Admin';
  const nameParts = displayName.split(/\s+/);
  const firstname = nameParts[0] || 'Platform';
  const lastname = nameParts.slice(1).join(' ') || 'Admin';
  const username = email.split('@')[0] || 'admin';
  const orgName = input.organizationName?.trim() || `${displayName}'s Organization`;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    let organizationId = existing?.organizationId || null;
    if (!organizationId) {
      const existingOrg = await tx.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (existingOrg) {
        organizationId = existingOrg.id;
      } else {
        const createdOrg = await tx.organization.create({
          data: {
            name: orgName,
            description: 'Spec-Driven AI Product Development Organization',
            status: 'ACTIVE',
            subscriptionTier: 'SCALE',
            subscriptionStatus: 'ACTIVE',
            subscriptionInterval: 'MONTHLY',
            credits: 20000,
            availableSeats: 99,
            totalSeats: 100,
            meta: JSON.stringify({
              brandColor: '#8E85FF',
              designStyle: 'Modern Minimal',
              velocityCalibration: {
                simpleUiChange: 1,
                crudEndpoint: 2,
                fullFeatureModule: 5,
                complexIntegration: 8,
              },
            }),
          },
        });
        organizationId = createdOrg.id;
        await tx.creditLedgerEntry.create({
          data: {
            organizationId: createdOrg.id,
            amount: 20000,
            type: 'CREDITED',
            action: 'Organization Bootstrap Credit Allocation',
            balanceAfter: 20000,
          },
        });
      }
    }

    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name: displayName,
            firstname,
            lastname,
            username,
            passwordHash: null,
            role: 'ADMIN',
            status: 'ACTIVE',
            organizationId,
            emailVerified: existing.emailVerified ?? now,
          },
        })
      : await tx.user.create({
          data: {
            email,
            name: displayName,
            firstname,
            lastname,
            username,
            passwordHash: null,
            role: 'ADMIN',
            specialty: 'Product Manager',
            status: 'ACTIVE',
            organizationId,
            emailVerified: now,
          },
        });

    await tx.passwordCredential.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        passwordHash,
        passwordChangedAt: now,
      },
      update: {
        passwordHash,
        passwordChangedAt: now,
        resetTokenHash: null,
        resetExpiresAt: null,
      },
    });

    await tx.session.deleteMany({ where: { userId: user.id } });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        action: 'admin.bootstrap',
        targetType: 'User',
        targetId: user.id,
        summary: existing
          ? `Promoted existing account ${user.email} to ADMIN via CLI bootstrap`
          : `Provisioned initial ADMIN account ${user.email} via CLI bootstrap`,
        metadata: JSON.stringify({
          created: !existing,
          role: 'ADMIN',
          organizationId,
        }),
      },
    });

    return {
      user,
      created: !existing,
      organizationId,
    };
  });
}
