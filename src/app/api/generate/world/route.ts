import { NextRequest, NextResponse } from 'next/server';
import { generateWorldPrompt } from '@/lib/generatorPrompts';
import { llm } from '@/lib/llm';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const { worldDescription } = await req.json();

    if (!worldDescription) {
      return NextResponse.json({ error: 'World description is required' }, { status: 400 });
    }

    const prompt = generateWorldPrompt(worldDescription);
    const result = await llm.generate([[new HumanMessage(prompt)]]);

    // Assuming the LLM returns a JSON string in the format { "world": "..." }
    const parsedResult = JSON.parse(result.generations[0][0].text);
    const generatedWorld = parsedResult.world;

    return NextResponse.json({ world: generatedWorld });
  } catch (error) {
    console.error('Error generating world data:', error);
    return NextResponse.json({ error: 'Failed to generate world data' }, { status: 500 });
  }
}
