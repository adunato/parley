import { Character, Persona } from '../types';
import { Message } from '@ai-sdk/react';
import { generateJSON } from '../llm';

export interface SceneReport {
    scene_id?: string;
    aggregate_traits: Record<string, number>; // e.g. "Openness": 0.8
    major_events: string[];
}

const ANALYST_SYSTEM_PROMPT = `You are the Analyst Engine for a relationship simulation.
Your task is to analyze the RECENT CHAT HISTORY (Scene) between a Player and a Character.

Output a JSON object with:
1. "aggregate_traits": A dictionary mapping behavioral traits to a 0.0-1.0 score representing the PLAYER'S behavior during this scene.
   - Include standard OCEAN traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) if applicable.
   - Include other relevant traits if strongly present: Aggression, Flirtation, Support.
   - 0.0 = Not present / Opposite.
   - 1.0 = Strongest display of this trait.
   
2. "major_events": A list of strings describing key events, revelations, or actions that occurred. Focus on things that would impact a long-term relationship.

Example Output:
{
  "aggregate_traits": {
    "Extraversion": 0.8,
    "Flirtation": 0.7,
    "Neuroticism": 0.2
  },
  "major_events": [
    "Player complimented the Character's outfit.",
    "Player asked about Character's family."
  ]
}
`;

export async function AnalyzeScene(
    chatHistory: Message[],
    character: Character,
    persona: Persona,
    modelName?: string
): Promise<SceneReport> {
    // We analyze a significant window of context, e.g., last 20 messages or entire scene.
    // required to be efficient, but enough to capture the "vibe".
    const recentHistory = chatHistory.slice(-20);

    const historyText = recentHistory.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `
${ANALYST_SYSTEM_PROMPT}

Context:
Character: ${character.basicInfo.name}
Player: ${persona.basicInfo.name}

Chat History:
${historyText}

Analyze the scene. Output JSON.
`;

    try {
        const result = await generateJSON(prompt, modelName);
        return {
            aggregate_traits: result.aggregate_traits || {},
            major_events: result.major_events || []
        };

    } catch (error) {
        console.error("Analyst Engine Error:", error);
        return { aggregate_traits: {}, major_events: [] };
    }
}
