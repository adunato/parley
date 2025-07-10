import { generateJSON } from '@/lib/llm';
import { generateWorldPrompt } from '@/lib/generatorPrompts';

export async function generateWorldData(worldDescription: string): Promise<string> {
  const prompt = generateWorldPrompt(worldDescription);
  const parsedResult = await generateJSON(prompt);
  return parsedResult.world;
}
