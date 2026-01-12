import { z } from 'zod';

export const lifeEventSchema = z.object({
  id: z.string().describe("Unique identifier for the life event, lower_snake_case (e.g., 'won_lottery', 'tragic_accident')"),
  text: z.string().describe("The narrative description of the life event"),
  provides: z.array(z.string()).optional().describe("List of tag IDs that this event provides to the character"),
  weights: z.record(z.string(), z.number()).describe("Mapping of tag IDs to connection weights. MUST include a 'DEFAULT' key with a base weight value."),
});

export const lifeEventGenerationSchema = z.object({
  lifeEvents: z.array(lifeEventSchema).describe("A list of generated life events"),
});
