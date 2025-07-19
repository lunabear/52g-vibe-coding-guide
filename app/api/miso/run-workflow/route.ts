'use server';

import { NextRequest, NextResponse } from 'next/server';

// Miso API 응답 타입 정의 (실제 응답 구조에 맞게 조정 필요)
interface MisoWorkflowOutput {
  explanation: string;
}

interface MisoResponse {
  output: MisoWorkflowOutput;
}

export async function POST(req: NextRequest) {
  const {
    query
  } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const misoEndpoint = process.env.MISO_ENDPOINT;
  const apiKey = process.env.MISO_GENERATOR_API_KEY;

  if (!misoEndpoint || !apiKey) {
    console.error('MISO_ENDPOINT or MISO_GENERATOR_API_KEY is not set in .env');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`${misoEndpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {
          query: query,
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Miso API error: ${response.status} ${response.statusText}`, errorBody);
      return NextResponse.json({ error: 'Failed to fetch from Miso API', details: errorBody }, { status: response.status });
    }

    const responseText = await response.text();
    console.log('Raw response from Miso API:', responseText);
    
    const misoData = JSON.parse(responseText);
    console.log('Parsed Miso data:', JSON.stringify(misoData, null, 2));

    // 다양한 응답 구조를 처리하여 최종 결과(explanation과 flow)를 추출합니다.
    let explanation;
    let flow;
    
    if (misoData.data && misoData.data.outputs) {
      // 실제 Miso API 응답 구조에서 explanation과 flow 추출
      explanation = misoData.data.outputs.explanation;
      flow = misoData.data.outputs.flow;
    } else if (misoData.outputs) {
      explanation = misoData.outputs.explanation || misoData.outputs.result;
      flow = misoData.outputs.flow;
    } else {
      // 다른 가능한 구조들도 체크
      explanation = misoData.explanation || misoData.result || misoData.message || misoData.response;
      flow = misoData.flow;
    }

    // 결과가 배열인 경우, 문자열로 합칩니다.
    if (Array.isArray(explanation)) {
      explanation = explanation.join('\n\n');
    }

    console.log('Extracted explanation:', explanation);
    console.log('Extracted flow:', flow);

    // 성공적으로 explanation을 추출했는지 확인 (flow는 선택적)
    if (explanation && typeof explanation === 'string') {
      const response: any = { explanation };
      if (flow && Array.isArray(flow)) {
        response.flow = flow;
      }
      return NextResponse.json(response, { status: 200 });
    }

    // explanation을 추출하지 못한 경우
    console.error('Could not extract explanation from Miso API response:', misoData);
    return NextResponse.json({ 
      error: 'Invalid response structure from Miso API',
      details: misoData 
    }, { status: 500 });

  } catch (error) {
    console.error('Error calling Miso workflow:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
