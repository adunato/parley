import { spineEventGenerationSchema } from './schemas';
import { EventNode, Tag, AgePhase } from './types';
import { PromptStore } from '../store/promptStore';
import { generateObject } from '../llm';

/**
 * Generates new Spine Node entities (milestones) using an LLM, based on an age phase.
 */
export async function generateSpineEvents(
  phase: AgePhase,
  count: number,
  existingNodes: EventNode[],
  userPrompt?: string
): Promise<{ events: EventNode[]; newTags: Tag[] }> {

  const template = PromptStore.getPrompt('spine_event_gen');

  const contextStr = existingNodes.length > 0
    ? existingNodes.map(e => `- ${e.text} (ID: ${e.id})`).join('\n')
    : 'None';

  const userPromptStr = userPrompt ? `--- USER DIRECTION ---\n${userPrompt}\n` : '';

  const prompt = template
    .split('{{count}}').join(count.toString())
    .split('{{phase}}').join(phase)
    .split('{{context}}').join(contextStr)
    .split('{{userPrompt}}').join(userPromptStr);

  try {
    const { object } = await generateObject({
      modelName: 'deepseek/deepseek-chat',
      schema: spineEventGenerationSchema,
      prompt,
      system: "You are a precise narrative data generator for a life simulation. You output valid JSON matching the requested schema exactly.",
    });

    return {
      events: object.spine_nodes.map(e => ({
        ...e,
        requires: e.requires || undefined,
        provides: e.provides || undefined,
      })) as EventNode[],
      newTags: (object.newTags || []).map(t => ({
        ...t,
        description: t.description || undefined
      })) as Tag[]
    };
  } catch (error) {
    console.error("Error generating spine events:", error);
    throw new Error("Failed to generate spine events via LLM.");
  }
}
