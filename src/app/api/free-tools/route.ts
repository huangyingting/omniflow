import { NextResponse } from 'next/server';
import { handleApiError, HttpError, parseJsonBody } from '@/lib/api';
import { runFreeAiTool } from '@/lib/omniflow/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{
      toolId?: string;
      input?: string;
    }>(request);

    const toolId = (body.toolId || 'prd-generator').trim();
    const input = (body.input || '').trim();
    if (!input) {
      throw new HttpError(
        400,
        'Please describe your product or feature to generate output.'
      );
    }

    const result = runFreeAiTool({ toolId, input });
    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
