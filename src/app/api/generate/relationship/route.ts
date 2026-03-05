import { NextRequest, NextResponse } from 'next/server';
import { generateRelationshipPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON, getLlm } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { character, persona, worldDescription, aiStyle, generationModel, relationshipContext } = await req.json();

    const prompt = generateRelationshipPrompt(character, persona, worldDescription, aiStyle, relationshipContext);
    const parsedResult = await generateJSON(prompt, generationModel);

    return NextResponse.json({ relationship: parsedResult });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error generating relationship data:', msg);
    return NextResponse.json({ error: 'Failed to generate relationship data', detail: msg }, { status: 500 });
  }
}