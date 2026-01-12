import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { lifeEventGenerationSchema } from './schemas';
import { EventNode, LifeEvent } from './types';
import { PromptStore } from '../store/promptStore';

// Configure OpenRouter as the provider
const openrouter = createOpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Generates new Life Event entities using an LLM, based on a source entity and context.
 * 
 * @param sourceEntity The entity (Origin, Education, Career, or LifeEvent) to connect from.
 * @param count Number of events to generate.
 * @param existingEvents List of existing events for context and variety.
 * @param userPrompt Optional prompt to guide the narrative style or content.
 * @returns A list of generated LifeEvent entities.
 */
export async function generateLifeEvents(
  sourceEntity: EventNode | LifeEvent,
  count: number,
  existingEvents: LifeEvent[],
  userPrompt?: string
): Promise<LifeEvent[]> {
  // Use a default model, preferably one good at following complex schemas
  const model = openrouter('deepseek/deepseek-chat');

  const template = PromptStore.getPrompt('life_event_gen');
  
  const sourceEntityStr = `ID: ${sourceEntity.id}\nDescription: ${sourceEntity.text}\nTags it Provides: ${JSON.stringify(sourceEntity.provides || [])}`;
  const contextStr = existingEvents.length > 0 ? existingEvents.map(e => `- ${e.text} (ID: ${e.id})`).join('\n') : 'None';
  const userPromptStr = userPrompt ? `--- USER DIRECTION ---\n${userPrompt}\n` : '';

  const prompt = template
    .replace('{{count}}', count.toString()) // Replace all occurrences if global, but string.replace only does first if not regex. 
    // Actually, template string replace with string argument only replaces the first occurrence. 
    // I should use split/join or replaceAll.
    .split('{{count}}').join(count.toString())
    .split('{{sourceEntity}}').join(sourceEntityStr)
    .split('{{context}}').join(contextStr)
    .split('{{userPrompt}}').join(userPromptStr);

  try {
    const { object } = await generateObject({
      model,
      schema: lifeEventGenerationSchema,
      prompt,
      // Optional: system message for better instruction following
      system: "You are a precise narrative data generator. You output valid JSON matching the requested schema exactly.",
    });

    return object.lifeEvents;
  } catch (error) {
    console.error("Error generating life events:", error);
    throw new Error("Failed to generate life events via LLM.");
  }
}
