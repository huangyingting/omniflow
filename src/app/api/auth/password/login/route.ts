import { NextResponse } from 'next/server';
import { authenticatePassword } from '@/lib/account-admission/credentials';
import { setDatabaseSessionCookie } from '@/lib/account-admission/session';
import { handleApiError, parseJsonBody } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ email?: string; password?: string }>(request);
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'invalid_credentials', message: 'Enter your email and password.' },
        },
        { status: 400 }
      );
    }

    const result = await authenticatePassword({ email, password });
    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'invalid_credentials',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        specialty: result.user.specialty,
        organizationId: result.user.organizationId,
      },
    });
    setDatabaseSessionCookie(response, result.session);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
