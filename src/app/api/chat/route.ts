import { LangChainAdapter } from 'ai';
import { llm } from '@/lib/llm';
import { generateSystemPrompt, getChatPrompt } from '@/lib/prompts/chatPrompts';
import { Message } from '@ai-sdk/react';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { useParleyStore } from '@/lib/store';

export async function POST(req: Request) {
  const { messages, character, persona, worldDescription, aiStyle } = await req.json();
  const relationship = character.relationships.find((rel: any) => rel.personaAlias === persona.alias);

  if (!character || !persona) {
    return new Response(JSON.stringify({ error: "Character and persona data are required." }), { status: 400 });
  }

  const chatSummaries = relationship?.chat_summaries;

  const finalSystemPrompt = generateSystemPrompt(character, persona, relationship, worldDescription, aiStyle, chatSummaries);

  const langchainMessages = messages.map((message: Message) => {
    if (message.role === 'user') {
      return new HumanMessage(message.content);
    } else if (message.role === 'assistant') {
      return new AIMessage(message.content);
    } else {
      return new SystemMessage(message.content);
    }
  });

  const systemMessage = new SystemMessage(`${finalSystemPrompt}\n${getChatPrompt(character)}`);
  const allMessages = [systemMessage, ...langchainMessages];

  const stream = await llm.stream(allMessages);

  return LangChainAdapter.toDataStreamResponse(stream);
}