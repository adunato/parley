import { NextRequest, NextResponse } from 'next/server';
import { generateImageDescriptionPrompt } from '@/lib/prompts/imageGenerationPrompts';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { characterOrPersonaData, aiStyle } = await req.json();

    if (!characterOrPersonaData) {
      return NextResponse.json({ error: 'Character or persona data is required' }, { status: 400 });
    }

    const prompt = generateImageDescriptionPrompt(characterOrPersonaData, aiStyle);
    const llmResponse = await generateJSON(prompt);

    // Assuming llmResponse contains the imageDescription directly or within a structured object
    const imageDescription = llmResponse.imageDescription || llmResponse; 

    return NextResponse.json({ imageDescription }, { status: 200 });
  } catch (error) {
    console.error('Error generating avatar description:', error);
    return NextResponse.json({ error: 'Failed to generate avatar description' }, { status: 500 });
  }
}