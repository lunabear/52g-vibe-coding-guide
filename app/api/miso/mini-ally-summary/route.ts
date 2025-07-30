import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.MISO_API_KEY;
    const endpoint = process.env.MISO_ENDPOINT;

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: 'MISO API not configured' },
        { status: 500 }
      );
    }

    const { documentType, currentContent, fixRequest } = await request.json();

    const response = await fetch(`${endpoint}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          context: currentContent,
          step: 'mini_ally_summary',
        },
        mode: 'blocking',
        user: 'prd-generator',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MISO API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fix document', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the new structured data from the response
    const outputs = data?.data?.outputs || {};
    
    // Extract all the new variables
    const personaProfile = outputs?.persona_profile || '';
    const painPointContext = outputs?.pain_point_context || '';
    const painPointReason = outputs?.pain_point_reason || '';
    const coreProblemStatement = outputs?.core_problem_statement || '';
    const solutionNameIdea = outputs?.solution_name_idea || '';
    const solutionMechanism = outputs?.solution_mechanism || '';
    const expectedOutcome = outputs?.expected_outcome || '';

    // Return the new structured format
    return NextResponse.json({ 
      personaProfile,
      painPointContext,
      painPointReason,
      coreProblemStatement,
      solutionNameIdea,
      solutionMechanism,
      expectedOutcome
    });
  } catch (error) {
    console.error('Error in mini-ally-summary route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}