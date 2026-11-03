import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  clearDatabaseSessionCookie,
  SESSION_COOKIES,
} from '@/lib/account-admission/session';

export async function POST() {
  const jar = await cookies();
  for (const name of SESSION_COOKIES) {
    const token = jar.get(name)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
    }
  }
  const response = NextResponse.json({ ok: true });
  clearDatabaseSessionCookie(response);
  return response;
}
