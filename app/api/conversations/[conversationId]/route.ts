import { NextRequest } from 'next/server';

const MISO_AGENT_ENDPOINT = process.env.MISO_AGENT_ENDPOINT || '';
const MISO_AGENT_API_KEY = process.env.MISO_AGENT_API_KEY || '';

// 대화 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(
      `${MISO_AGENT_ENDPOINT}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to delete conversation' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 대화 이름 변경
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  try {
    const body = await request.json();
    const { userId, name, autoGenerate = false } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(
      `${MISO_AGENT_ENDPOINT}/conversations/${conversationId}/rename`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          name: name || '',
          auto_generate: autoGenerate,
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to rename conversation' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Rename conversation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}