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
    const { allQuestionsAndAnswers } = body;

    if (!allQuestionsAndAnswers || !Array.isArray(allQuestionsAndAnswers)) {
      return NextResponse.json(
        { error: 'Questions and answers are required' },
        { status: 400 }
      );
    }

    // 질문과 답변을 상세한 context로 변환
    const contextString = allQuestionsAndAnswers
      .map((qa: { question: string; answer: string }) => `질문: ${qa.question}\n답변: ${qa.answer}`)
      .join('\n\n');

    const response = await fetch(`${endpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          context: contextString,
          step: 'generate_prd',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MISO API Error Response:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate PRD' },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // 중첩된 응답 구조 처리
    let result;
    if (data.data && data.data.outputs && data.data.outputs.result) {
      result = data.data.outputs.result;
    } else if (data.outputs && data.outputs.result) {
      result = data.outputs.result;
    } else if (data.result) {
      result = data.result;
    }
    
    // 배열인 경우 join
    const prdContent = Array.isArray(result) ? result.join('\n\n') : result || '';
    
    if (!prdContent) {
      console.warn('Unexpected MISO API response structure for PRD:', data);
    }
    
    return NextResponse.json({ prd: prdContent });
  } catch (error) {
    console.error('Failed to generate PRD:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}