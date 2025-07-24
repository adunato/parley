import { NextRequest, NextResponse } from 'next/server';
import { generatePersonaPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';
import { Persona } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { personaDescription, worldDescription, aiStyle, generationModel } = await req.json();

    const prompt = generatePersonaPrompt(personaDescription, worldDescription, aiStyle);
    const parsedResult = await generateJSON(prompt, generationModel);

    const persona: Persona = {
        id: parsedResult.id,
        basicInfo: parsedResult.basicInfo
    }

    return NextResponse.json({ persona: persona });
  } catch (error) {
    console.error('Error generating persona data:', error);
    return NextResponse.json({ error: 'Failed to generate persona data' }, { status: 500 });
  }
}
