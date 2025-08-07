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
    query,
    miso_app_type
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
    const requestBody: any = {
      inputs: {
        query: query,
      },
      mode: 'blocking',
      user: 'prd-generator',
    };

    // miso_app_type이 있으면 inputs에 추가
    if (miso_app_type) {
      requestBody.inputs.miso_app_type = miso_app_type;
    }

    const response = await fetch(`${misoEndpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
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

    // miso_app_type이 있는 경우 (미소 앱 설계하기)와 없는 경우 (워크플로우 생성하기) 구분
    if (miso_app_type) {
      // 미소 앱 설계하기의 경우 - prompt와 knowledge 추출에 집중
      let prompt;
      let knowledge;
      
      // details.data.outputs 구조 확인
      if (misoData.details && misoData.details.data && misoData.details.data.outputs) {
        const outputs = misoData.details.data.outputs;
        prompt = outputs.prompt;
        knowledge = outputs.knowledge;
      }
      // data.outputs 구조 확인
      else if (misoData.data && misoData.data.outputs) {
        const outputs = misoData.data.outputs;
        prompt = outputs.prompt;
        knowledge = outputs.knowledge;
      }
      // outputs 직접 확인
      else if (misoData.outputs) {
        prompt = misoData.outputs.prompt;
        knowledge = misoData.outputs.knowledge;
      }
      
      console.log('Extracted prompt for MISO App:', prompt);
      console.log('Extracted knowledge for MISO App:', knowledge);
      
      // prompt가 있으면 성공 응답
      if (prompt && typeof prompt === 'string') {
        return NextResponse.json({ 
          explanation: '', // 빈 문자열로 설정
          prompt: prompt,
          knowledge: knowledge || '' // knowledge도 포함
        }, { status: 200 });
      }
      
      // prompt를 찾지 못한 경우
      console.error('Could not extract prompt from MISO App response:', misoData);
      return NextResponse.json({ 
        error: 'Invalid MISO App response structure - prompt not found',
        details: misoData 
      }, { status: 500 });
      
    } else {
      // 기존 워크플로우 생성하기의 경우 - explanation과 flow 추출
      let explanation;
      let flow;
      
      if (misoData.data && misoData.data.outputs) {
        // 실제 Miso API 응답 구조에서 explanation, flow 추출
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
      console.error('Could not extract explanation from Workflow response:', misoData);
      return NextResponse.json({ 
        error: 'Invalid Workflow response structure - explanation not found',
        details: misoData 
      }, { status: 500 });
    }


  } catch (error) {
    console.error('Error calling Miso workflow:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
