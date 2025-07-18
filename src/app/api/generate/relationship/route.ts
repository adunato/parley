import { NextRequest, NextResponse } from 'next/server';
import { generateRelationshipPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON, getLlm } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { character, persona, worldDescription, aiStyle, generationModel } = await req.json();

    const prompt = generateRelationshipPrompt(character, persona, worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt, generationModel);

    return NextResponse.json({ relationship: parsedResult });
  } catch (error) {
    console.error('Error generating relationship data:', error);
    return NextResponse.json({ error: 'Failed to generate relationship data' }, { status: 500 });
  }
}