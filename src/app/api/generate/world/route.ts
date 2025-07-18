import { NextRequest, NextResponse } from 'next/server';
import { generateWorldPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON, getLlm } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { worldDescription, aiStyle, generationModel } = await req.json();
    const prompt = generateWorldPrompt(worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt, generationModel);
    const generatedWorld = parsedResult.world;

    return NextResponse.json({ world: generatedWorld });
  } catch (error) {
    console.error('Error generating world data:', error);
    return NextResponse.json({ error: 'Failed to generate world data' }, { status: 500 });
  }
}
