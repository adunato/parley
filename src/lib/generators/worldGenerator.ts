import { llm } from '@/lib/llm';
import { generateWorldPrompt } from '@/lib/generatorPrompts';
import { HumanMessage } from '@langchain/core/messages';

export async function generateWorldData(worldDescription: string): Promise<string> {
  const prompt = generateWorldPrompt(worldDescription);
  const result = await llm.generate([[new HumanMessage(prompt)]]);
  const parsedResult = JSON.parse(result.generations[0][0].text);
  return parsedResult.world;
}
