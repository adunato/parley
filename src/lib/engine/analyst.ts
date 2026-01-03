import { Character, Persona, Relationship } from '../types';
import { Message } from '@ai-sdk/react';
import { generateJSON } from '../llm';

export type SignalCategory =
    | 'FLIRT'
    | 'INSULT'
    | 'COMPLIMENT'
    | 'AGREE'
    | 'DISAGREE'
    | 'GIFT_SMALL'
    | 'GIFT_LARGE'
    | 'REVEAL_SECRET'
    | 'BETRAYAL'
    | 'SACRIFICE'
    | 'DEMAND';

export interface Signal {
    category: SignalCategory;
    weight: number; // 1-10 intensity
    reasoning: string;
}

const ANALYST_SYSTEM_PROMPT = `You are the Analyst Engine for a relationship simulation. 
Your task is to analyze the LATEST response from the PLAYER (User) in the chat history and categorize their action into distinct behavioral signals.

Categories:
- FLIRT: Romantic or sexual advances.
- INSULT: Disrespect, mockery, or hostility.
- COMPLIMENT: Praise or admiration.
- AGREE: Siding with the character, validation.
- DISAGREE: Opposing the character, conflict.
- GIFT_SMALL: Giving a minor item or favor.
- GIFT_LARGE: Giving a significant item or major favor.
- REVEAL_SECRET: Sharing personal/vulnerable information.
- BETRAYAL: Breaking trust, lying, or backstabbing.
- SACRIFICE: Taking harm or loss for the character's sake.
- DEMAND: Ordering or forcing the character to do something.

Output a JSON object with a "signals" array. Each signal has:
- category: One of the above.
- weight: 1-5 integer (1=Subtle/Minor, 3=Moderate, 5=Extreme/Direct).
- reasoning: Short explanation.

If the user message is neutral or contains no clear signal, return an empty array.
`;

export async function AnalyzeTurn(
    chatHistory: Message[],
    character: Character,
    persona: Persona,
    modelName?: string
): Promise<Signal[]> {
    // We only care about the last message from the user, but context matters.
    // We'll send the last few messages for context.
    const recentHistory = chatHistory.slice(-5);

    // Construct a simple text representation
    const historyText = recentHistory.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `
${ANALYST_SYSTEM_PROMPT}

Context:
Character: ${character.basicInfo.name}
Player: ${persona.basicInfo.name}

Chat History:
${historyText}

Analyze the LAST message from the Player. output JSON.
`;

    try {
        const result = await generateJSON(prompt, modelName);
        return result.signals || [];

    } catch (error) {
        console.error("Analyst Engine Error:", error);
        return [];
    }
}
