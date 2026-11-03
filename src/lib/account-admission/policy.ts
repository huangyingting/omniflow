export const ACCOUNT_ADMISSION_MODES = ['invitation-only', 'open'] as const;
export type AccountAdmissionMode = (typeof ACCOUNT_ADMISSION_MODES)[number];

export const VALID_USER_ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const;
export type UserRole = (typeof VALID_USER_ROLES)[number];

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string): boolean {
  const normalized = normalizeAccountEmail(email);
  const separator = normalized.indexOf('@');
  const dotAfterAt = normalized.indexOf('.', separator + 2);
  return (
    normalized.length >= 5 &&
    normalized.length <= 320 &&
    separator > 0 &&
    separator === normalized.lastIndexOf('@') &&
    dotAfterAt > separator + 1 &&
    dotAfterAt < normalized.length - 1 &&
    !/\s/.test(normalized)
  );
}

export function resolveAccountAdmissionMode(
  rawValue = process.env.ACCOUNT_ADMISSION_MODE
): AccountAdmissionMode {
  if (rawValue?.trim().toLowerCase() === 'open') {
    return 'open';
  }
  return 'invitation-only';
}

export function accountAdmissionMode(): AccountAdmissionMode {
  return resolveAccountAdmissionMode();
}

export function normalizeUserRole(role?: string | null): UserRole {
  const upper = (role || 'MEMBER').trim().toUpperCase();
  if (upper === 'ADMIN' || upper === 'MEMBER' || upper === 'VIEWER') {
    return upper;
  }
  return 'MEMBER';
}

export function accountAdmissionPublicOrigin(requestUrl?: string): string {
  const envOrigin =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL;
  if (envOrigin) {
    try {
      const url = new URL(envOrigin);
      if (['http:', 'https:'].includes(url.protocol)) {
        return url.origin;
      }
    } catch {
      // fall through
    }
  }
  if (requestUrl) {
    return new URL(requestUrl).origin;
  }
  return 'http://localhost:3000';
}

export function accountAdmissionSecretLink(
  pathPrefix: string,
  token: string,
  requestUrl?: string
): string {
  const origin = accountAdmissionPublicOrigin(requestUrl);
  const normalizedPrefix = pathPrefix.startsWith('/') ? pathPrefix : `/${pathPrefix}`;
  return new URL(`${normalizedPrefix.replace(/\/$/, '')}/${encodeURIComponent(token)}`, origin).toString();
}
