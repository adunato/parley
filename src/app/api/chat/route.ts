import { LangChainAdapter } from 'ai';
import { llm } from '@/lib/llm';
import { SYSTEM_PROMPT} from '@/lib/chatPrompts';
import { Message } from '@ai-sdk/react';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
export async function POST(req: Request) {
  const { messages } = await req.json();

  const langchainMessages = messages.map((message: Message) => {
    if (message.role === 'user') {
      return new HumanMessage(message.content);
    } else if (message.role === 'assistant') {
      return new AIMessage(message.content);
    } else {
      return new SystemMessage(message.content);
    }
  });

  const systemMessage = new SystemMessage(`${SYSTEM_PROMPT}\n{{character_json}}`);
  const allMessages = [systemMessage, ...langchainMessages];

  const stream = await llm.stream(allMessages);

  return LangChainAdapter.toDataStreamResponse(stream);
}