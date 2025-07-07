import { NextRequest, NextResponse } from 'next/server';

interface MISOWorkflowResponse {
  data?: {
    outputs?: {
      result_planner?: string[];
      result_designer?: string[];
      result_developer?: string[];
    };
  };
  outputs?: {
    result_planner?: string[];
    result_designer?: string[];
    result_developer?: string[];
  };
  result_planner?: string[];
  result_designer?: string[];
  result_developer?: string[];
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
    
    // 새로운 응답 구조 처리
    let planner: string[] = [];
    let designer: string[] = [];
    let developer: string[] = [];
    
    // data.data.outputs 구조
    if (data.data && data.data.outputs) {
      planner = data.data.outputs.result_planner || [];
      designer = data.data.outputs.result_designer || [];
      developer = data.data.outputs.result_developer || [];
    }
    // data.outputs 구조
    else if (data.outputs) {
      planner = data.outputs.result_planner || [];
      designer = data.outputs.result_designer || [];
      developer = data.outputs.result_developer || [];
    }
    // 최상위 구조
    else {
      planner = data.result_planner || [];
      designer = data.result_designer || [];
      developer = data.result_developer || [];
    }
    
    // 하나라도 질문이 있으면 반환
    if (planner.length > 0 || designer.length > 0 || developer.length > 0) {
      return NextResponse.json({
        questions: {
          planner,
          designer,
          developer
        }
      });
    }
    
    console.warn('Unexpected MISO API response structure:', JSON.stringify(data, null, 2));
    return NextResponse.json({
      questions: {
        planner: [],
        designer: [],
        developer: []
      }
    });
  } catch (error) {
    console.error('Failed to generate final questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}