import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MISO_API_KEY;
    const endpoint = process.env.MISO_ENDPOINT;

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: 'MISO API not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prdContent } = body;

    if (!prdContent) {
      return NextResponse.json(
        { error: 'PRD content is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${endpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          context: prdContent,
          step: 'generate_database',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MISO API Error Response:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate database schema' },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // 응답 구조 처리
    if (data.data && data.data.outputs && data.data.outputs.result) {
      return NextResponse.json({ schema: data.data.outputs.result });
    }
    
    if (data.outputs && data.outputs.result) {
      return NextResponse.json({ schema: data.outputs.result });
    }
    
    if (data.result) {
      return NextResponse.json({ schema: data.result });
    }
    
    console.warn('Unexpected MISO API response structure for database:', data);
    return NextResponse.json({ schema: '' });
  } catch (error) {
    console.error('Failed to generate database schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}