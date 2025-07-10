import { llm } from '@/lib/llm';
import { generateWorldPrompt } from '@/lib/generatorPrompts';
import { HumanMessage } from '@langchain/core/messages';

export async function generateWorldData(worldDescription: string): Promise<string> {
  const prompt = generateWorldPrompt(worldDescription);
  const result = await llm.generate([[new HumanMessage(prompt)]]);
  const responseContent = result.generations[0][0].text;
  const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);

  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error("Could not parse JSON from LLM response.");
  }

  const parsedResult = JSON.parse(jsonMatch[1]);
  return parsedResult.world;
}
