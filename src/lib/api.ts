import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIES } from '@/lib/account-admission/session';
import { AccountAdmissionError } from '@/lib/account-admission/errors';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'request_error'
  ) {
    super(message);
  }
}

export async function currentUser() {
  const jar = await cookies();
  for (const name of SESSION_COOKIES) {
    const token = jar.get(name)?.value;
    if (!token) continue;
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });
    if (session && session.expires > new Date() && session.user.status === 'ACTIVE') {
      return session.user;
    }
  }
  return null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) {
    throw new HttpError(401, 'Sign in to continue.', 'unauthorized');
  }
  return user;
}

export async function requireWriteAccess() {
  const user = await requireUser();
  if (user.role === 'VIEWER') {
    throw new HttpError(
      403,
      'Your account has read-only VIEWER permissions.',
      'viewer_read_only'
    );
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    throw new HttpError(
      403,
      'Administrator access is required.',
      'admin_required'
    );
  }
  return user;
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  try {
    const data = await request.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpError(400, 'A valid JSON object is required.', 'invalid_json');
    }
    return data as T;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, 'A valid JSON request body is required.', 'invalid_json');
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AccountAdmissionError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  if (error instanceof HttpError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  console.error('Unhandled API Error:', error);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'internal_error',
        message: error instanceof Error ? error.message : 'Unexpected server error.',
      },
    },
    { status: 500 }
  );
}
