export const WORLD_JSON_STRUCTURE = `{
  "world": string; // A detailed description of the world.
}`;

import { PromptStore } from '../store/promptStore';

export const generateWorldPrompt = (worldDescription: string, aiStyle?: string) => {
    let prompt = PromptStore.getPrompt('world_gen');

    // Replacements
    prompt = prompt.split('{{worldDescription}}').join(worldDescription ? `Input World Description: ${worldDescription}` : '');
    prompt = prompt.split('{{aiStyle}}').join(aiStyle ? `AI Style: ${aiStyle}` : '');

    return prompt;
};


export const CHARACTER_JSON_STRUCTURE = generateCharacterJsonStructureWithoutRelationships();

export const generateCharacterPrompt = (characterDescription: string, worldDescription: string, aiStyle: string, existingContext?: any) => {
    let prompt = PromptStore.getPrompt('character_gen');

    const worldSection = worldDescription ? `World Description: ${worldDescription}` : '';
    const styleSection = aiStyle ? `AI Style: ${aiStyle}` : '';
    const charSection = characterDescription ? `Input Character Description: ${characterDescription}` : '';

    let contextSection = '';
    if (existingContext && Object.keys(existingContext).length > 0) {
        contextSection = `
--- EXISTING CONTEXT ---
The user has already defined the following attributes. Use them as the immutable foundation for the character and generate the remaining JSON fields to match/complement them.
${Object.entries(existingContext).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}
------------------------
`;
    }

    prompt = prompt.split('{{jsonStructure}}').join(CHARACTER_JSON_STRUCTURE);
    prompt = prompt.split('{{characterDescription}}').join(charSection);
    prompt = prompt.split('{{worldDescription}}').join(worldSection);
    prompt = prompt.split('{{aiStyle}}').join(styleSection);
    prompt = prompt.split('{{existingContext}}').join(contextSection);

    return prompt;
};

export const RELATIONSHIP_JSON_STRUCTURE = `{
  "satisfaction": number,       // 0 (active animosity) to 100 (complete satisfaction). 50 is neutral.
  "commitment": number,      // 0 (strangers/no obligation) to 100 (total devotion)
  "intimacy": number,         // 0 (complete strangers) to 100 (deepest secrets shared)
  "trust": number,      // 0 (active distrust/unknown) to 100 (blind faith)
  "passion": number,        // 0 (indifferent/repulsed) to 100 (intense attraction)
  "description": string        // Description of the relationship (e.g. "Strangers," "A powerful enemy," "Romantic partners")
}`;

import { Character, Persona as PlayerPersona, Relationship } from "../types";
import { generateCharacterJsonStructure, generatePersonaJsonStructure, generateCharacterJsonStructureWithoutRelationships } from '../schemaGenerator';

export const generateRelationshipPrompt = (character: Character, persona: PlayerPersona, worldDescription?: string, aiStyle?: string, relationshipContext?: string) => {
    const characterJson = JSON.stringify(character, null, 2);
    const personaJson = JSON.stringify(persona, null, 2);

    let prompt = PromptStore.getPrompt('relationship_gen');

    const worldSection = worldDescription ? `World Description: ${worldDescription}` : '';
    const styleSection = aiStyle ? `AI Style: ${aiStyle}` : '';
    const contextSection = relationshipContext ? `Relationship Context: ${relationshipContext}\nUses this context to determine the nature and initial stats of the relationship.` : PromptStore.getPrompt('relationship_context_fallback');

    prompt = prompt.split('{{jsonStructure}}').join(RELATIONSHIP_JSON_STRUCTURE);
    prompt = prompt.split('{{character}}').join(characterJson);
    prompt = prompt.split('{{persona}}').join(personaJson);
    prompt = prompt.split('{{relationshipContext}}').join(contextSection);
    prompt = prompt.split('{{worldDescription}}').join(worldSection);
    prompt = prompt.split('{{aiStyle}}').join(styleSection);

    return prompt;
};


export const PERSONA_JSON_STRUCTURE = generatePersonaJsonStructure();

export const generatePersonaPrompt = (personaDescription: string, worldDescription: string, aiStyle: string) => {
    let prompt = PromptStore.getPrompt('persona_gen');

    const worldSection = worldDescription ? `World Description: ${worldDescription}` : '';
    const styleSection = aiStyle ? `AI Style: ${aiStyle}` : '';
    const personaSection = personaDescription ? `Input Persona Description: ${personaDescription}` : '';

    prompt = prompt.split('{{jsonStructure}}').join(PERSONA_JSON_STRUCTURE);
    prompt = prompt.split('{{personaDescription}}').join(personaSection);
    prompt = prompt.split('{{worldDescription}}').join(worldSection);
    prompt = prompt.split('{{aiStyle}}').join(styleSection);

    return prompt;
};


export const generateAIStylePrompt = (aiStyleDescription: string) => {
    let prompt = PromptStore.getPrompt('ai_style_gen');

    const inputSection = aiStyleDescription ? `Input AI Style Description: ${aiStyleDescription}` : '';

    prompt = prompt.split('{{jsonStructure}}').join(AI_STYLE_JSON_STRUCTURE);
    prompt = prompt.split('{{aiStyleDescription}}').join(inputSection);

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

    let prompt = PromptStore.getPrompt('relationship_delta');

    const worldSection = worldDescription ? `--- WORLD DESCRIPTION ---\n\n ${worldDescription}` : '';
    const styleSection = aiStyle ? `--- AI STYLE ---\n\n ${aiStyle}` : '';

    prompt = prompt.split('{{jsonStructure}}').join(RELATIONSHIP_JSON_STRUCTURE);
    prompt = prompt.split('{{character}}').join(characterJson);
    prompt = prompt.split('{{persona}}').join(personaJson);
    prompt = prompt.split('{{currentRelationship}}').join(currentRelationshipJson);
    prompt = prompt.split('{{chatHistory}}').join(chatHistoryJson);
    prompt = prompt.split('{{latestExchange}}').join(latestExchangeJson);
    prompt = prompt.split('{{worldDescription}}').join(worldSection);
    prompt = prompt.split('{{aiStyle}}').join(styleSection);

    return prompt;
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

    let prompt = PromptStore.getPrompt('chat_summary');

    const worldSection = worldDescription ? `--- WORLD DESCRIPTION ---\n\n ${worldDescription}` : '';
    const styleSection = aiStyle ? `--- AI STYLE ---\n\n ${aiStyle}` : '';

    prompt = prompt.split('{{jsonStructure}}').join(CHAT_SUMMARY_JSON_STRUCTURE);
    prompt = prompt.split('{{chatHistory}}').join(history);
    prompt = prompt.split('{{worldDescription}}').join(worldSection);
    prompt = prompt.split('{{aiStyle}}').join(styleSection);

    return prompt;
};
