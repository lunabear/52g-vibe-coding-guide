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
    const { prdContent, designContent } = body;

    if (!prdContent || !designContent) {
      return NextResponse.json(
        { error: 'PRD content and design content are required' },
        { status: 400 }
      );
    }

    // XML 형식으로 컨텍스트 구성
    const xmlContext = `<context>
<prd>
${prdContent}
</prd>
<design>
${designContent}
</design>
</context>`;

    const response = await fetch(`${endpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          context: xmlContext,
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
    let result;
    if (data.data && data.data.outputs && data.data.outputs.result) {
      result = data.data.outputs.result;
    } else if (data.outputs && data.outputs.result) {
      result = data.outputs.result;
    } else if (data.result) {
      result = data.result;
    }
    
    // 배열인 경우 join
    const schemaContent = Array.isArray(result) ? result.join('\n\n') : result || '';
    
    if (!schemaContent) {
      console.warn('Unexpected MISO API response structure for database:', data);
    }
    
    return NextResponse.json({ schema: schemaContent });
  } catch (error) {
    console.error('Failed to generate database schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}