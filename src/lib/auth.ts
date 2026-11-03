import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import {
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from './account-admission/session';
import { verifyPassword } from './account-admission/passwords';
import { normalizeAccountEmail } from './account-admission/policy';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'database',
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = normalizeAccountEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { passwordCredential: true },
        });
        if (!user || !user.passwordCredential || user.status !== 'ACTIVE') {
          return null;
        }
        const ok = await verifyPassword(
          credentials.password,
          user.passwordCredential.passwordHash
        );
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        Object.assign(session.user, {
          id: user.id,
          role: (user as { role?: string }).role || 'MEMBER',
          organizationId: (user as { organizationId?: string }).organizationId || null,
        });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'omniflow-local-dev-secret-key-9f8e7d6c5b4a3210fedcba9876543210',
  useSecureCookies: SESSION_COOKIE_OPTIONS.secure,
};
