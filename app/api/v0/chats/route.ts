import { NextRequest } from 'next/server';

const V0_API_ENDPOINT = 'https://api.v0.dev/v1';
const V0_API_KEY = process.env.V0_API_KEY;

export async function POST(request: NextRequest) {
  if (!V0_API_KEY) {
    return new Response(JSON.stringify({ error: 'V0_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { projectId, url } = body || {};

    // console.log('V0_API_KEY:', V0_API_KEY);
    // console.log('V0_API_ENDPOINT:', V0_API_ENDPOINT);
    console.log('=========================================')
    console.log('projectId:', projectId);
    console.log('url:', url);
    console.log('=========================================')

    if (!projectId || typeof projectId !== 'string') {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      system: '',
      message: '다음 지시사항을 내리기 전까치 아무것도 하지마',
      modelConfiguration: {
        modelId: 'v0-1.5-md',
        imageGenerations: false,
        thinking: false,
      },
      projectId,
      attachments: [
        { url },
      ],
    };

    const response = await fetch(`${V0_API_ENDPOINT}/chats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${V0_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    if (!response.ok) {
      return new Response(text || JSON.stringify({ error: 'Failed to create chat' }), {
        status: response.status,
        headers: { 'Content-Type': contentType },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('v0 create chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


