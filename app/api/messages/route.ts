import { NextRequest } from 'next/server';

const MISO_AGENT_ENDPOINT = process.env.MISO_AGENT_ENDPOINT || '';
const MISO_AGENT_API_KEY = process.env.MISO_AGENT_API_KEY || '';

// 특정 대화의 메시지 내역 가져오기
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId') || 'prd-generator-user';
    const firstId = searchParams.get('firstId') || '';
    const limit = searchParams.get('limit') || '20';

    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'Conversation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({
      user: userId,
      conversation_id: conversationId,
      limit,
    });

    if (firstId) {
      params.append('first_id', firstId);
    }

    const response = await fetch(`${MISO_AGENT_ENDPOINT}/messages?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Transform MISO API response to match our Message interface
    // Each MISO message contains both query (user) and answer (assistant)
    const messages: any[] = [];
    
    // Process messages in reverse order since API returns newest first
    const reversedData = [...(data.data || [])].reverse();
    
    reversedData.forEach((msg: any) => {
      // Add user message
      if (msg.query) {
        messages.push({
          id: `${msg.id}-query`,
          content: msg.query,
          role: 'user',
          timestamp: new Date(msg.created_at),
        });
      }
      
      // Add assistant message
      if (msg.answer) {
        messages.push({
          id: `${msg.id}-answer`,
          content: msg.answer,
          role: 'assistant',
          timestamp: new Date(msg.created_at),
        });
      }
    });

    return new Response(JSON.stringify({ 
      messages: messages, // Now in chronological order (oldest first)
      hasMore: data.has_more,
      limit: data.limit 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}