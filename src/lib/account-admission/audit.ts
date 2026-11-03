import { prisma } from '@/lib/prisma';

export type AuditLogInput = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: input.actorId || null,
        actorEmail: input.actorEmail || null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId || null,
        summary: input.summary,
        metadata: JSON.stringify(input.metadata || {}),
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}

export async function listAuditLogs(options?: {
  action?: string;
  limit?: number;
}) {
  const limit = Math.min(200, Math.max(1, options?.limit || 50));
  return prisma.auditLog.findMany({
    where: options?.action ? { action: options.action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}
