import { NextResponse } from 'next/server';
import { registerWithInvitation } from '@/lib/account-admission/registration';
import { setDatabaseSessionCookie } from '@/lib/account-admission/session';
import { handleApiError, parseJsonBody } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{
      email?: string;
      password?: string;
      name?: string;
      specialty?: string;
      token?: string;
      invitationToken?: string;
    }>(request);

    const token = (body.token || body.invitationToken || '').trim();
    const email = (body.email || '').trim();
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name : null;
    const specialty = typeof body.specialty === 'string' ? body.specialty : null;

    const result = await registerWithInvitation({
      token,
      email,
      password,
      name,
      specialty,
    });

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          specialty: result.user.specialty,
          organizationId: result.user.organizationId,
        },
      },
      { status: 201 }
    );
    setDatabaseSessionCookie(response, result.session);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
