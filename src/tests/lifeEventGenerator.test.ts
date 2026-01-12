import { generateLifeEvents } from '../lib/generator/lifeEventGenerator';
import { generateObject } from 'ai';
import { EventNode } from '../lib/generator/types';
import { PromptStore } from '../lib/store/promptStore';

// Mock the AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

// Mock the OpenAI provider
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => {
    const provider = jest.fn();
    return provider;
  }),
}));

// Mock PromptStore
jest.mock('../lib/store/promptStore', () => ({
  PromptStore: {
    getPrompt: jest.fn().mockReturnValue('Test Template with {{count}} events for {{sourceEntity}} context: {{context}} {{userPrompt}}'),
  }
}));

describe('LifeEventGenerator Service', () => {
  const mockSource: EventNode = {
    id: 'noble_origin',
    slot: 'ORIGIN',
    text: 'Born into a noble family',
    provides: ['noble', 'wealthy'],
    weights: { 'DEFAULT': 1 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate and parse life events', async () => {
    const mockEvents = [
      {
        id: 'inherited_manor',
        text: 'Inherited a dusty old manor',
        provides: ['landowner'],
        weights: { 'DEFAULT': 1, 'noble': 10 }
      }
    ];
    const mockTags = [{ id: 'landowner', description: 'Owns land' }];

    (generateObject as jest.Mock).mockResolvedValue({
      object: {
        lifeEvents: mockEvents,
        newTags: mockTags
      }
    });

    const result = await generateLifeEvents(mockSource, 1, []);

    expect(generateObject).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('noble_origin'),
      system: expect.any(String)
    }));
    
    expect(result).toEqual({
      lifeEvents: mockEvents,
      newTags: mockTags
    });
  });

  it('should include user prompt in the LLM call', async () => {
    (generateObject as jest.Mock).mockResolvedValue({
      object: { lifeEvents: [], newTags: [] }
    });

    const userPrompt = "Make it spooky";
    await generateLifeEvents(mockSource, 1, [], userPrompt);

    expect(generateObject).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining(userPrompt)
    }));
  });

  it('should handle LLM errors gracefully', async () => {
    (generateObject as jest.Mock).mockRejectedValue(new Error('API Down'));

    await expect(generateLifeEvents(mockSource, 1, [])).rejects.toThrow('Failed to generate life events via LLM.');
  });
});
