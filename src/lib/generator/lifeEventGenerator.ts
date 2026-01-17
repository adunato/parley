import { lifeEventGenerationSchema } from './schemas';
import { EventNode, LifeEvent, Tag } from './types';
import { PromptStore } from '../store/promptStore';
import { generateObject } from '../llm';

/**
 * Generates new Life Event entities using an LLM, based on a source entity and context.
 * 
 * @param sourceEntity The entity (Origin, Education, Career, or LifeEvent) to connect from.
 * @param count Number of events to generate.
 * @param existingEvents List of existing events for context and variety.
 * @param userPrompt Optional prompt to guide the narrative style or content.
 * @returns A list of generated LifeEvent entities and any new tags discovered.
 */
export async function generateLifeEvents(
  sourceEntity: EventNode | LifeEvent | undefined,
  count: number,
  existingEvents: LifeEvent[],
  userPrompt?: string
): Promise<{ lifeEvents: LifeEvent[]; newTags: Tag[] }> {

  const template = PromptStore.getPrompt('life_event_gen');

  const sourceEntityStr = sourceEntity
    ? `ID: ${sourceEntity.id}\nDescription: ${sourceEntity.text}\nTags it Provides: ${JSON.stringify(sourceEntity.provides || [])}`
    : "None (Generate independent events)";

  const contextStr = existingEvents.length > 0 ? existingEvents.map(e => `- ${e.text} (ID: ${e.id})`).join('\n') : 'None';
  const userPromptStr = userPrompt ? `--- USER DIRECTION ---\n${userPrompt}\n` : '';

  const prompt = template
    .split('{{count}}').join(count.toString())
    .split('{{sourceEntity}}').join(sourceEntityStr)
    .split('{{context}}').join(contextStr)
    .split('{{userPrompt}}').join(userPromptStr);

  try {
    const { object } = await generateObject({
      modelName: 'deepseek/deepseek-chat',
      schema: lifeEventGenerationSchema,
      prompt,
      system: "You are a precise narrative data generator. You output valid JSON matching the requested schema exactly.",
    });

    return {
      lifeEvents: object.lifeEvents.map(e => ({
        ...e,
        requires: e.requires || undefined,
        provides: e.provides || undefined,
      })) as LifeEvent[],
      newTags: (object.newTags || []).map(t => ({
        ...t,
        description: t.description || undefined
      })) as Tag[]
    };
  } catch (error) {
    console.error("Error generating life events:", error);
    throw new Error("Failed to generate life events via LLM.");
  }
}
