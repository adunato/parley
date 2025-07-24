import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';
import { Character } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { characterDescription, worldDescription, aiStyle, generationModel } = await req.json();

    const prompt = generateCharacterPrompt(characterDescription, worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt, generationModel);

    const character: Character = {
        id: parsedResult.id,
        basicInfo: parsedResult.basicInfo,
        personality: parsedResult.personality,
        preferences: parsedResult.preferences,
        relationships: []
    }

    return NextResponse.json({ character: character });
  } catch (error) {
    console.error('Error generating character data:', error);
    return NextResponse.json({ error: 'Failed to generate character data' }, { status: 500 });
  }
}
