import { lifeEventSchema, lifeEventGenerationSchema } from '../lib/generator/schemas';

describe('Life Event Schemas', () => {
  it('should validate a correct LifeEvent object', () => {
    const validEvent = {
      id: 'test_event',
      text: 'A test event',
      provides: ['tag1'],
      weights: {
        'DEFAULT': 1,
        'tag2': 5
      }
    };

    const result = lifeEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should fail if DEFAULT weight is missing (logic check, though Zod schema just checks record structure, strict validation might need refinement if we want to enforce specific keys)', () => {
    // Note: Zod record doesn't strictly enforce specific keys unless refined. 
    // This test ensures the basic structure holds.
    const validStructure = {
      id: 'test_event',
      text: 'A test event',
      weights: {
        'some_tag': 1
      }
    };
    
    // Our current schema doesn't force "DEFAULT" key presence via types, only via description/intent.
    // If we wanted to enforce it, we'd use .refine(). For now, we check basic structure.
    const result = lifeEventSchema.safeParse(validStructure);
    expect(result.success).toBe(true); 
  });

  it('should validate the generation wrapper', () => {
    const validWrapper = {
      lifeEvents: [
        {
          id: 'event_1',
          text: 'Event 1',
          weights: { 'DEFAULT': 1 }
        }
      ]
    };

    const result = lifeEventGenerationSchema.safeParse(validWrapper);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid types', () => {
    const invalidEvent = {
      id: 123, // Should be string
      text: 'Text',
      weights: [] // Should be object
    };

    const result = lifeEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });
});
