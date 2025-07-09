import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.MISO_API_KEY;
    const endpoint = process.env.MISO_ENDPOINT;

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: 'MISO API not configured' },
        { status: 500 }
      );
    }

    const { documentType, currentContent, fixRequest } = await request.json();

    const response = await fetch(`${endpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          context: currentContent,
          request: fixRequest,
          step: 'fix_mode',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MISO API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fix document', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the fixed content from the response
    const result = data?.data?.outputs?.result || [];
    const fixedContent = Array.isArray(result) ? result.join('\n\n') : result;

    return NextResponse.json({ fixedContent });
  } catch (error) {
    console.error('Error in fix-document route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}