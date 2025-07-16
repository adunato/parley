import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { CHAT_SUMMARISATION_PROMPT } from '@/lib/prompts/chatPrompts';

export async function POST(req: NextRequest) {
  try {
    const { chatHistory } = await req.json();

    if (!chatHistory) {
      return NextResponse.json({ error: 'Chat history is required' }, { status: 400 });
    }

    const prompt = CHAT_SUMMARISATION_PROMPT(chatHistory);
    const response = await llm.invoke(prompt);

    return NextResponse.json({ summary: response.content });
  } catch (error) {
    console.error('Error in chat summarization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
