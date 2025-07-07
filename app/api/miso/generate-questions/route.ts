import { NextRequest, NextResponse } from 'next/server';

interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result?: string[];
    };
  };
}

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
    const { context } = body;

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
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
          context: JSON.stringify(context),
          step: 'generate_questions',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MISO API Error Response:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // 중첩된 응답 구조 처리: data.data.outputs.result
    if (data.data && data.data.outputs && data.data.outputs.result && Array.isArray(data.data.outputs.result)) {
      return NextResponse.json({ questions: data.data.outputs.result });
    }
    
    // 대체 응답 구조들
    if (data.outputs && data.outputs.result && Array.isArray(data.outputs.result)) {
      return NextResponse.json({ questions: data.outputs.result });
    }
    
    if (data.result && Array.isArray(data.result)) {
      return NextResponse.json({ questions: data.result });
    }
    
    console.warn('Unexpected MISO API response structure:', JSON.stringify(data, null, 2));
    return NextResponse.json({ questions: [] });
  } catch (error) {
    console.error('Failed to generate final questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}