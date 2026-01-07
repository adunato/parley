import { LangChainAdapter } from 'ai';
import { getLlm } from '@/lib/llm';
import { generateSystemPrompt, getChatPrompt } from '@/lib/prompts/chatPrompts';
import { Message } from '@ai-sdk/react';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { GenerateSystemPrompt } from '@/lib/engine/director';

export async function POST(req: Request) {
  const { messages, character, persona, worldDescription, aiStyle, chatModel, systemPromptTemplate, locationDescription } = await req.json();
  const llm = getLlm(chatModel);
  const relationship = character.relationships.find((rel: any) => rel.personaId === persona.id);

  if (!character || !persona) {
    return new Response(JSON.stringify({ error: "Character and persona data are required." }), { status: 400 });
  }

  const chatSummaries = relationship?.chat_summaries;

  const actingInstructions = relationship ? GenerateSystemPrompt(character, relationship) : "";
  const finalSystemPrompt = generateSystemPrompt(character, persona, relationship, systemPromptTemplate, worldDescription, aiStyle, chatSummaries, actingInstructions, locationDescription);

  console.log("--- GENERATED SYSTEM PROMPT ---");
  console.log(finalSystemPrompt);
  console.log("-------------------------------");

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