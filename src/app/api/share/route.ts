import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const text = formData.get('text') as string;
    const url = formData.get('url') as string;

    console.log('[Share API] Received shared content:', { title, text, url });

    return NextResponse.json({
      success: true,
      message: 'Content shared successfully',
    });
  } catch (error) {
    console.error('[Share API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process shared content' },
      { status: 400 }
    );
  }
}
