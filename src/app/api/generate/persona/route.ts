import { NextRequest, NextResponse } from 'next/server';
import { generatePersonaPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { personaDescription, worldDescription, aiStyle } = await req.json();

    const prompt = generatePersonaPrompt(personaDescription, worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt);

    return NextResponse.json({ persona: parsedResult.playerProfile });
  } catch (error) {
    console.error('Error generating persona data:', error);
    return NextResponse.json({ error: 'Failed to generate persona data' }, { status: 500 });
  }
}
