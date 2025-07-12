import { NextRequest, NextResponse } from 'next/server';
import { generateRelationshipPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { characterId, personaAlias, worldDescription, aiStyle } = await req.json();

    const prompt = generateRelationshipPrompt(characterId, personaAlias, worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt);

    return NextResponse.json({ relationship: parsedResult });
  } catch (error) {
    console.error('Error generating relationship data:', error);
    return NextResponse.json({ error: 'Failed to generate relationship data' }, { status: 500 });
  }
}