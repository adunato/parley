import { LangChainAdapter } from 'ai';
import { llm } from '@/lib/llm';
import { generateSystemPrompt, CHAT_PROMPT } from '@/lib/chatPrompts';
import { Message } from '@ai-sdk/react';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { useParleyStore } from '@/lib/store';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // This is a server component, so we can't directly use useParleyStore here.
  // The selected character and persona should be passed from the client.
  // For now, we'll assume the client sends the character and persona data.
  // In a real application, you might fetch this from a database based on user session.
  const { character, persona } = await req.json();

  if (!character || !persona) {
    return new Response(JSON.stringify({ error: "Character and persona data are required." }), { status: 400 });
  }

  const finalSystemPrompt = generateSystemPrompt(character, persona);

  const langchainMessages = messages.map((message: Message) => {
    if (message.role === 'user') {
      return new HumanMessage(message.content);
    } else if (message.role === 'assistant') {
      return new AIMessage(message.content);
    } else {
      return new SystemMessage(message.content);
    }
  });

  const systemMessage = new SystemMessage(`${finalSystemPrompt}\n${CHAT_PROMPT}`);
  const allMessages = [systemMessage, ...langchainMessages];

  const stream = await llm.stream(allMessages);

  return LangChainAdapter.toDataStreamResponse(stream);
}