import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, getLlm } from '@/lib/llm';
import { generateChatSummaryPrompt } from '@/lib/prompts/generatorPrompts';

export async function POST(req: NextRequest) {
  try {
    const { chatHistory, worldInfo, aiStyle, characterName, playerPersonaName, summarizationModel } = await req.json();

    if (!chatHistory) {
      return NextResponse.json({ error: 'Chat history is required' }, { status: 400 });
    }
    const prompt = generateChatSummaryPrompt(chatHistory, characterName, playerPersonaName, worldInfo, aiStyle);
    const response = await generateJSON(prompt, summarizationModel);

    return NextResponse.json({ summary: response.summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
