import { NextRequest } from 'next/server';

const MISO_AGENT_ENDPOINT = process.env.MISO_AGENT_ENDPOINT || '';
const MISO_AGENT_API_KEY = process.env.MISO_AGENT_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('user') as string || 'prd-generator-user';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create FormData for MISO API
    const misoFormData = new FormData();
    misoFormData.append('file', file);
    misoFormData.append('user', userId);

    // Upload file to MISO API
    const response = await fetch(`${MISO_AGENT_ENDPOINT}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISO_AGENT_API_KEY}`,
      },
      body: misoFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: 'File upload failed', details: error }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}