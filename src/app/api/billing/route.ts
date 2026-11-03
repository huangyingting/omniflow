import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  HttpError,
  parseJsonBody,
  requireUser,
  requireWriteAccess,
} from '@/lib/api';
import { PRICING_PLANS } from '@/lib/omniflow/catalog';
import { recordAuditLog } from '@/lib/account-admission/audit';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId || !user.organization) {
      throw new HttpError(400, 'Organization context not found.');
    }

    const ledger = await prisma.creditLedgerEntry.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      ok: true,
      organization: user.organization,
      plans: PRICING_PLANS,
      ledger,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireWriteAccess();
    if (!user.organizationId || !user.organization) {
      throw new HttpError(400, 'Organization context not found.');
    }

    const body = await parseJsonBody<{
      action?: 'upgrade-plan' | 'claim-reward' | 'top-up';
      planTier?: 'FREE' | 'PRO' | 'TEAMS' | 'ENTERPRISE';
      billingInterval?: 'MONTHLY' | 'ANNUAL';
      rewardType?: string;
      creditsToAdd?: number;
    }>(request);

    if (body.action === 'claim-reward') {
      const bonus = Number(body.creditsToAdd) || 500;
      const rewardName = body.rewardType || 'Referral & Community Share Reward';
      const nextCredits = user.organization.credits + bonus;

      const updatedOrg = await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          credits: nextCredits,
        },
      });

      await prisma.creditLedgerEntry.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          amount: bonus,
          type: 'REWARD',
          action: rewardName,
          balanceAfter: nextCredits,
        },
      });

      return NextResponse.json({
        ok: true,
        organization: updatedOrg,
        message: `Added +${bonus.toLocaleString()} AI Credits (${rewardName}).`,
      });
    }

    const selectedTier = body.planTier || 'PRO';
    const planMeta =
      PRICING_PLANS.find((p) => p.tier === selectedTier) || PRICING_PLANS[1];

    const updatedOrg = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        subscriptionTier: selectedTier,
        subscriptionInterval: body.billingInterval || 'ANNUAL',
        subscriptionStatus: 'ACTIVE',
        credits: planMeta.credits,
      },
    });

    await prisma.creditLedgerEntry.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        amount: planMeta.credits,
        type: 'GRANTED',
        action: `Plan Subscription Updated to ${planMeta.name} (${
          body.billingInterval || 'ANNUAL'
        })`,
        balanceAfter: planMeta.credits,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'billing.subscription_updated',
      targetType: 'Organization',
      targetId: user.organizationId,
      summary: `Upgraded organization subscription to ${planMeta.name} (${selectedTier})`,
    });

    return NextResponse.json({
      ok: true,
      organization: updatedOrg,
      message: `Upgraded workspace to ${planMeta.name} plan with ${planMeta.credits.toLocaleString()} AI Credits.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
