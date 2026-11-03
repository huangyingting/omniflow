import { NextResponse } from 'next/server';
import {
  createAccountInvitation,
  listAccountInvitations,
} from '@/lib/account-admission/invitations';
import { accountAdmissionSecretLink } from '@/lib/account-admission/policy';
import { handleApiError, parseJsonBody, requireAdmin } from '@/lib/api';

export async function GET() {
  try {
    const admin = await requireAdmin();
    const invitations = await listAccountInvitations(admin.organizationId);
    return NextResponse.json({ ok: true, invitations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await parseJsonBody<{
      email?: string;
      role?: string;
      specialty?: string;
      expiresInDays?: number;
    }>(request);

    const grant = await createAccountInvitation({
      email: typeof body.email === 'string' ? body.email : '',
      role: typeof body.role === 'string' ? body.role : 'MEMBER',
      specialty: typeof body.specialty === 'string' ? body.specialty : 'Product Manager',
      expiresInDays:
        typeof body.expiresInDays === 'number' ? body.expiresInDays : 7,
      organizationId: admin.organizationId,
      invitedById: admin.id,
      invitedByEmail: admin.email,
    });

    const inviteUrl = accountAdmissionSecretLink(
      '/invite',
      grant.token,
      request.url
    );

    return NextResponse.json(
      {
        ok: true,
        invitation: grant.invitation,
        token: grant.token,
        inviteUrl,
        delivery: grant.delivery,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
