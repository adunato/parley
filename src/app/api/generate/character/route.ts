import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { characterDescription } = await req.json();

    const prompt = generateCharacterPrompt(characterDescription);
    const parsedResult = await generateJSON(prompt);

    return NextResponse.json({ character: parsedResult });
  } catch (error) {
    console.error('Error generating character data:', error);
    return NextResponse.json({ error: 'Failed to generate character data' }, { status: 500 });
  }
}
