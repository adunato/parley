import { Character, Persona } from '../types';
import { Message } from '@ai-sdk/react';
import { generateJSON } from '../llm';
import { PromptStore } from '../store/promptStore';

export interface SceneReport {
    scene_id?: string;
    aggregate_traits: Record<string, number>; // e.g. "Openness": 0.8
    major_events: string[];
}

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

    let prompt = PromptStore.getPrompt('analyst_system');

    prompt = prompt.split('{{character}}').join(character.basicInfo.name);
    prompt = prompt.split('{{persona}}').join(persona.basicInfo.name);
    prompt = prompt.split('{{chatHistory}}').join(historyText);

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
