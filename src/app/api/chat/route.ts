import { LangChainAdapter } from 'ai';
import { llm } from '@/lib/llm';
import { SYSTEM_PROMPT, CHAT_PROMPT } from '@/lib/chatPrompts';
import { Message } from '@ai-sdk/react';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const characterJsonPath = path.join(process.cwd(), 'sample_character.json');
  const characterJson = await fs.readFile(characterJsonPath, 'utf8');

  const finalSystemPrompt = SYSTEM_PROMPT.replace('{{character_json}}', characterJson);

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