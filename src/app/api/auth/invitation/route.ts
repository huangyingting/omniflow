import { NextResponse } from 'next/server';
import { inspectAccountInvitation } from '@/lib/account-admission/invitations';
import { handleApiError } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    const view = await inspectAccountInvitation(token);
    const statusMap: Record<typeof view.status, number> = {
      pending: 200,
      accepted: 409,
      revoked: 410,
      expired: 410,
      invalid: 404,
    };
    return NextResponse.json(
      {
        ok: view.status === 'pending',
        invitation: view,
      },
      { status: statusMap[view.status] || 404 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
