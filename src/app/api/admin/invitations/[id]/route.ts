import { NextResponse } from 'next/server';
import {
  revokeAccountInvitation,
  rotateAccountInvitation,
} from '@/lib/account-admission/invitations';
import { accountAdmissionSecretLink } from '@/lib/account-admission/policy';
import { handleApiError, parseJsonBody, requireAdmin } from '@/lib/api';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await parseJsonBody<{
      action?: string;
      expiresInDays?: number;
    }>(request);

    if (body.action === 'revoke') {
      const revoked = await revokeAccountInvitation(id, {
        id: admin.id,
        email: admin.email,
      });
      return NextResponse.json({ ok: true, invitation: revoked });
    }

    const rotated = await rotateAccountInvitation(id, {
      expiresInDays:
        typeof body.expiresInDays === 'number' ? body.expiresInDays : 7,
      actorId: admin.id,
      actorEmail: admin.email,
    });
    const inviteUrl = accountAdmissionSecretLink(
      '/invite',
      rotated.token,
      request.url
    );

    return NextResponse.json({
      ok: true,
      invitation: rotated.invitation,
      token: rotated.token,
      inviteUrl,
      delivery: rotated.delivery,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const revoked = await revokeAccountInvitation(id, {
      id: admin.id,
      email: admin.email,
    });
    return NextResponse.json({ ok: true, invitation: revoked });
  } catch (error) {
    return handleApiError(error);
  }
}
