import { NextRequest, NextResponse } from 'next/server';
import { generatePersonaPrompt } from '@/lib/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { personaDescription } = await req.json();

    if (!personaDescription) {
      return NextResponse.json({ error: 'Persona description is required' }, { status: 400 });
    }

    const prompt = generatePersonaPrompt(personaDescription);
    const parsedResult = await generateJSON(prompt);

    return NextResponse.json({ persona: parsedResult.playerProfile });
  } catch (error) {
    console.error('Error generating persona data:', error);
    return NextResponse.json({ error: 'Failed to generate persona data' }, { status: 500 });
  }
}
