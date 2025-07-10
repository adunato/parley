import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT, CHAT_PROMPT } from '@/lib/chatPrompts';
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n${CHAT_PROMPT}` },
      ...messages,
    ],
  });

  return new Response(result.toDataStream(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}