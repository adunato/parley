export const WORLD_JSON_STRUCTURE = `{
  "world": string; // A detailed description of the world.
}`;

export const generateWorldPrompt = (worldDescription: string, aiStyle?: string) => {
    let prompt = `
You are a world-building AI for a text adventure game. The resulting description must be in 3rd person. Your responses MUST be a JSON object conforming to the following structure:
${WORLD_JSON_STRUCTURE}

Generate a detailed world description. The output should be a JSON object with a single key, "world", containing a string value of the generated world description.`;
    if (worldDescription) {
        prompt += `\n\nInput World Description: ${worldDescription}`;
    }
    if (aiStyle) {
        prompt += `\n\nAI Style: ${aiStyle}`;
    }
    prompt += `\n\nJSON Output:\n`;
    return prompt;
};


export const CHARACTER_JSON_STRUCTURE = generateCharacterJsonStructureWithoutRelationships();

export const generateCharacterPrompt = (characterDescription: string, worldDescription: string, aiStyle: string) => {
    let prompt = `
You are a character-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure. Ensure all property names and string values are double-quoted and special characters are properly escaped:
${CHARACTER_JSON_STRUCTURE}

Generate a detailed character profile.`;

    if (characterDescription) {
        prompt += `\n\nInput Character Description: ${characterDescription}`;
    }

    if (worldDescription) {
        prompt += `\n\nWorld Description: ${worldDescription}`;
    }

    if (aiStyle) {
        prompt += `\n\nAI Style: ${aiStyle}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};

export const RELATIONSHIP_JSON_STRUCTURE = `{
  "satisfaction": number,       // An integer between 0 (highly dissatisfied) and 100 (complete satisfaction)
  "commitment": number,      // An integer between 0 (no commitment) and 100 (total devotion)
  "intimacy": number,         // An integer between 0 (strangers) and 100 (deepest darkest secrets shared)
  "trust": number,      // An integer between 0 (complete distrust) and 100 (blind faith)
  "passion": number,        // An integer between 0 (platonic/repulsed) and 100 (intense attraction)
  "description": string        // Description of the relationship (e.g. "A close friend, a romantic relationship, a powerful enemy, etc.")
}`;

import { Character, Persona as PlayerPersona, Relationship } from "../types";
import { generateCharacterJsonStructure, generatePersonaJsonStructure, generateCharacterJsonStructureWithoutRelationships } from '../schemaGenerator';

export const generateRelationshipPrompt = (character: Character, persona: PlayerPersona, worldDescription?: string, aiStyle?: string) => {
    const characterJson = JSON.stringify(character, null, 2);
    const personaJson = JSON.stringify(persona, null, 2);

    let prompt = `
You are a relationship-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure. Ensure all property names and string values are double-quoted and special characters are properly escaped:
${RELATIONSHIP_JSON_STRUCTURE}

Generate a detailed relationship profile between the following character and player persona. Use the data provided below, the resulting relationship should take into account the likely relationship between the character and player persona based on their characteristics, age and background.

--- CHARACTER DATA ---
${characterJson}
----------------------

--- PLAYER PERSONA DATA ---
${personaJson}
---------------------------

Based on the provided character and player persona data, generate their relationship profile.`;

    if (worldDescription) {
        prompt += `\n\nWorld Description: ${worldDescription}`;
    }

    if (aiStyle) {
        prompt += `\n\nAI Style: ${aiStyle}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};


export const PERSONA_JSON_STRUCTURE = generatePersonaJsonStructure();

export const generatePersonaPrompt = (personaDescription: string, worldDescription: string, aiStyle: string) => {
    let prompt = `
You are a player persona-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${PERSONA_JSON_STRUCTURE}

Generate a detailed player persona profile.`;

    if (personaDescription) {
        prompt += `\n\nInput Persona Description: ${personaDescription}`;
    }

    if (worldDescription) {
        prompt += `\n\nWorld Description: ${worldDescription}`;
    }

    if (aiStyle) {
        prompt += `\n\nAI Style: ${aiStyle}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};


export const generateAIStylePrompt = (aiStyleDescription: string) => {
    let prompt = `
You are an AI assistant that generates writing styles for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${AI_STYLE_JSON_STRUCTURE}

Generate a detailed AI style. The output should be a JSON object with a single key, "aiStyle", containing a string value of the generated AI style.`

    if (aiStyleDescription) {
        prompt += `\n\nInput AI Style Description: ${aiStyleDescription}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};

export const AI_STYLE_JSON_STRUCTURE = `{
  "aiStyle": string; // A detailed description of the AI's writing style.
}`;

import { Message } from "@ai-sdk/react";

export const generateRelationshipDeltaPrompt = (
    character: Character,
    persona: PlayerPersona,
    chatHistory: Message[],
    latestExchange: { userMessage: string; characterResponse: string },
    currentRelationship: Relationship,
    worldDescription?: string,
    aiStyle?: string
) => {
    const characterJson = JSON.stringify(character, null, 2);
    const personaJson = JSON.stringify(persona, null, 2);
    const chatHistoryJson = JSON.stringify(chatHistory, null, 2);
    const latestExchangeJson = JSON.stringify(latestExchange, null, 2);
    const currentRelationshipJson = JSON.stringify(currentRelationship, null, 2);

    return `
You are a relationship analysis AI for a text adventure game. Your task is to analyze the latest exchange between a character and a player persona and determine how it affects their relationship. Your responses MUST be a JSON object conforming to the following structure. Ensure all property names and string values are double-quoted and special characters are properly escaped:
${RELATIONSHIP_JSON_STRUCTURE}

The numerical values in the JSON should represent the *delta* (change) in the relationship metrics (e.g., 5 for an increase of 5, -3 for a decrease of 3). 

The 'description' field should explain *why* these changes occurred, use a *concise* and *very short* description capturing the main impact of the exchange.

--- CHARACTER DATA ---
${characterJson}
----------------------

--- PLAYER PERSONA DATA ---
${personaJson}
---------------------------

--- CURRENT RELATIONSHIP DATA ---
${currentRelationshipJson}
---------------------------------

--- CHAT HISTORY (excluding latest exchange) ---
${chatHistoryJson}
------------------------------------------------

--- LATEST CHAT EXCHANGE ---
${latestExchangeJson}
----------------------------

Analyze the latest chat exchange in the context of the character, player persona, and their current relationship. Determine the delta (change) for each relationship metric (satisfaction, commitment, intimacy, trust, passion) and provide a concise description of why these changes occurred. The description should focus on the impact of this specific exchange.
passion should change based on the character data - preferences - "attractedToTraits" and "dislikesTraits" which should drive the change in passion depending on how the latest exchange relates to those traits.

${worldDescription ? `\n\n--- WORLD DESCRIPTION ---\n\n ${worldDescription}` : ''}

${aiStyle ? `\n\n--- AI STYLE ---\n\n ${aiStyle}` : ''}

JSON Output:
`;
};

export const CHAT_SUMMARY_JSON_STRUCTURE = `{
  "summary": string; // A concise summary of the chat history.
}`;

export const generateChatSummaryPrompt = (chatHistory: Message[], characterName: string, playerPersonaName: string, worldDescription?: string, aiStyle?: string) => {
    const history = chatHistory.map((m: Message) => {
        if (m.role === 'user') {
            return `${playerPersonaName}: ${m.content}`;
        } else if (m.role === 'assistant') {
            return `${characterName}: ${m.content}`;
        }
        return `${m.role}: ${m.content}`;
    }).join('\n************************\n');
    return `
You are a chat summarization AI. Your responses MUST be a JSON object conforming to the following structure:
${CHAT_SUMMARY_JSON_STRUCTURE}

Summarise the following chat history. The summary should be concise and focus on the key events, decisions, and outcomes of the story so far.

--- CHAT HISTORY ---
${history}
--------------------

${worldDescription ? `\n\n--- WORLD DESCRIPTION ---\n\n ${worldDescription}` : ''}

${aiStyle ? `\n\n--- AI STYLE ---\n\n ${aiStyle}` : ''}

JSON Output:
`
};
