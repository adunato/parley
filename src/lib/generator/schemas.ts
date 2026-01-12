import { z } from 'zod';

export const lifeEventSchema = z.object({
  id: z.string().describe("Unique identifier for the life event, lower_snake_case (e.g., 'won_lottery', 'tragic_accident')"),
  text: z.string().describe("The narrative description of the life event"),
  provides: z.array(z.string()).optional().describe("List of tag IDs that this event provides to the character"),
  weights: z.record(z.string(), z.number()).describe("Mapping of tag IDs to connection weights. MUST include a 'DEFAULT' key with a base weight value."),
});

export const lifeEventGenerationSchema = z.object({
  lifeEvents: z.array(lifeEventSchema).describe("A list of generated life events"),
  newTags: z.array(z.object({
    id: z.string().describe("The unique identifier of the tag"),
    description: z.string().optional().describe("A brief description of what this tag represents")
  })).optional().describe("A list of new tags introduced by these events that were not in the source or context")
});
