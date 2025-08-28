import { NextRequest } from 'next/server';

const MISO_AGENT_ENDPOINT = process.env.MISO_AGENT_ENDPOINT || '';
const MISO_AGENT_API_KEY = process.env.MISO_AGENT_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationId, userId = 'prd-generator-user', files = [] } = body;

    // 텍스트 없이 이미지(파일)만 전송된 경우를 허용
    const hasFiles = Array.isArray(files) && files.length > 0;
    const effectiveQuery = typeof query === 'string' && query.trim().length > 0
      ? query
      : (hasFiles ? '이미지 내용을 분석해줘.' : '');

    // 텍스트와 파일이 모두 없으면 요청 거절
    if (!effectiveQuery && !hasFiles) {
      return new Response(JSON.stringify({ error: 'query 또는 files가 필요합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // MISO Agent API로 요청 전송
    const response = await fetch(`${MISO_AGENT_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: effectiveQuery,
        mode: 'streaming',
        conversation_id: conversationId || '',
        user: userId,
        files,
        auto_gen_name: true,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Chat API error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 스트리밍 응답 전달
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // 마지막 줄은 불완전할 수 있으므로 버퍼에 보관
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                controller.enqueue(new TextEncoder().encode(line + '\n\n'));
              }
            }
          }

          // 남은 버퍼 처리
          if (buffer && buffer.startsWith('data: ')) {
            controller.enqueue(new TextEncoder().encode(buffer + '\n\n'));
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 대화 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'prd-generator-user';
    const lastId = searchParams.get('lastId') || '';
    const limit = searchParams.get('limit') || '20';

    const params = new URLSearchParams({
      user: userId,
      limit,
      sort_by: '-updated_at',
    });

    if (lastId) {
      params.append('last_id', lastId);
    }

    const response = await fetch(`${MISO_AGENT_ENDPOINT}/conversations?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Get conversations error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}