import { NextRequest } from 'next/server';

const V0_API_ENDPOINT = 'https://api.v0.dev/v1';
const V0_API_KEY = process.env.V0_API_KEY || 'v1:team_VXOpli8PNx0SDCGSdsjjDoJw:HXQUeQ2ywG1EtUVASv6LDE0N';

export async function POST(request: NextRequest) {
  if (!V0_API_KEY) {
    return new Response(JSON.stringify({ error: 'V0_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { name} = body || {};

    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('V0_API_KEY:', V0_API_KEY);
    console.log('V0_API_ENDPOINT:', V0_API_ENDPOINT);

    const response = await fetch(`${V0_API_ENDPOINT}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${V0_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    if (!response.ok) {
      return new Response(text || JSON.stringify({ error: 'Failed to create project' }), {
        status: response.status,
        headers: { 'Content-Type': contentType },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('v0 create project error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


