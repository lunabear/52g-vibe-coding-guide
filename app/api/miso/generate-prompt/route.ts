import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, flow_context } = await request.json();

    console.log('프롬프트 생성 요청:', { query, flow_context });

    if (!query || !flow_context) {
      return NextResponse.json(
        { error: 'query와 flow_context가 필요합니다.' },
        { status: 400 }
      );
    }

    const misoEndpoint = process.env.MISO_ENDPOINT;
    const apiKey = process.env.MISO_GENERATOR_API_KEY;

    if (!misoEndpoint || !apiKey) {
      console.error('MISO_ENDPOINT or MISO_GENERATOR_API_KEY is not set in .env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 프롬프트 생성을 위한 특별한 쿼리 구성
    const promptQuery = `프롬프트 생성 요청: ${query}

컨텍스트:
${flow_context}

위 정보를 바탕으로 해당 LLM 노드가 사용할 수 있는 구체적이고 실용적인 프롬프트를 생성해주세요.`;

    const response = await fetch(`${misoEndpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {
          query: promptQuery,
        },
        mode: 'blocking',
        user: 'prd-generator-prompt',
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

    // 다양한 응답 구조를 처리하여 프롬프트 결과 추출
    let result;
    
    if (misoData.data && misoData.data.outputs) {
      result = misoData.data.outputs.explanation || misoData.data.outputs.result;
    } else if (misoData.outputs) {
      result = misoData.outputs.explanation || misoData.outputs.result;
    } else {
      result = misoData.explanation || misoData.result || misoData.message || misoData.response;
    }

    // 결과가 배열인 경우, 문자열로 합칩니다.
    if (Array.isArray(result)) {
      result = result.join('\n\n');
    }

    console.log('Extracted prompt result:', result);

    // 성공적으로 프롬프트를 추출했는지 확인
    if (result && typeof result === 'string') {
      return NextResponse.json({ result }, { status: 200 });
    }

    // 프롬프트를 추출하지 못한 경우
    console.error('Could not extract prompt from Miso API response:', misoData);
    return NextResponse.json({ 
      error: 'Invalid response structure from Miso API',
      details: misoData 
    }, { status: 500 });

  } catch (error) {
    console.error('프롬프트 생성 중 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `프롬프트 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
} 