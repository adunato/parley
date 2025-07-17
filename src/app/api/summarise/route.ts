import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { generateChatSummaryPrompt } from '@/lib/prompts/generatorPrompts';

export async function POST(req: NextRequest) {
  try {
    const { chatHistory, worldInfo, aiStyle, characterName, playerPersonaName } = await req.json();

    if (!chatHistory) {
      return NextResponse.json({ error: 'Chat history is required' }, { status: 400 });
    }
    const prompt = generateChatSummaryPrompt(chatHistory, characterName, playerPersonaName, worldInfo, aiStyle);
    const response = await generateJSON(prompt);

    return NextResponse.json({ summary: response.summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
