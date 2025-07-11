import { NextRequest, NextResponse } from 'next/server';
import { generateWorldPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { worldDescription } = await req.json();

    if (!worldDescription) {
      return NextResponse.json({ error: 'World description is required' }, { status: 400 });
    }

    const prompt = generateWorldPrompt(worldDescription);
    const parsedResult = await generateJSON(prompt);
    const generatedWorld = parsedResult.world;

    return NextResponse.json({ world: generatedWorld });
  } catch (error) {
    console.error('Error generating world data:', error);
    return NextResponse.json({ error: 'Failed to generate world data' }, { status: 500 });
  }
}
