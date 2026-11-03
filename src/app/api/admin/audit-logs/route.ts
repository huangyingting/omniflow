import { NextResponse } from 'next/server';
import { listAuditLogs } from '@/lib/account-admission/audit';
import { handleApiError, requireAdmin } from '@/lib/api';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || undefined;
    const limit = Number(searchParams.get('limit') || 100);
    const logs = await listAuditLogs({ action, limit });
    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    return handleApiError(error);
  }
}
