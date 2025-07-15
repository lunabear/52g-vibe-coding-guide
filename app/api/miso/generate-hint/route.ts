import { NextRequest, NextResponse } from 'next/server';

interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result?: string;
    };
  };
  outputs?: {
    result?: string;
  };
  result?: string;
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
    const { context, request: hintRequest } = body;

    if (!context || !hintRequest) {
      return NextResponse.json(
        { error: 'Both context and request are required' },
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
          context: context,
          request: hintRequest,
          step: 'mini_ally_hint',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MISO API Error Response:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate hint' },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // 새로운 응답 구조 처리
    let result: string = '';
    
    // data.data.outputs 구조
    if (data.data && data.data.outputs) {
      result = data.data.outputs.result || '';
    }
    // data.outputs 구조
    else if (data.outputs) {
      result = data.outputs.result || '';
    }
    // 최상위 구조
    else {
      result = data.result || '';
    }
    
    // 결과가 있으면 반환
    if (result) {
      return NextResponse.json({
        hint: result
      });
    }
    
    console.warn('Unexpected MISO API response structure:', JSON.stringify(data, null, 2));
    return NextResponse.json({
      hint: '힌트를 생성하지 못했습니다.'
    });
  } catch (error) {
    console.error('Failed to generate hint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}