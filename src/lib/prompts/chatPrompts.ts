import { Character, ChatSummary, Persona as PlayerPersona, Relationship } from "../types";
import { RELATIONSHIP_JSON_STRUCTURE } from "./generatorPrompts";

export const generateSystemPrompt = (
    character: Character,
    playerPersona: PlayerPersona,
    relationship: Relationship,
    template: string,
    worldDescription?: string,
    aiStyle?: string,
    chatSummaries?: ChatSummary[],
    actingInstructions?: string
) => {
    const characterJson = JSON.stringify(character, null, 2);
    const playerPersonaJson = JSON.stringify(playerPersona, null, 2);
    const relationshipJson = JSON.stringify(relationship, null, 2);

    let worldSection = '';
    if (worldDescription) {
        worldSection = `--- WORLD DESCRIPTION ---\n${worldDescription}\n-------------------------`;
    }

    let styleSection = '';
    if (aiStyle) {
        styleSection = `--- AI STYLE ---\n${aiStyle}\n----------------`;
    }

    let summariesSection = '';
    if (chatSummaries && chatSummaries.length > 0) {
        const summariesText = chatSummaries.map((summary, index) => `- ${summary.summary}`).join('\n');
        summariesSection = `--- PREVIOUS CONVERSATION SUMMARIES ---\nThis is a summary of your past conversations with ${playerPersona.basicInfo.name}. Use it to recall past events and maintain conversational continuity.\n${summariesText}\n-----------------------------------------`;
    }

    // Default template fallback if empty (though caller should provide it)
    let prompt = template || "";

    const substitutions: Record<string, string> = {
        '{{characterName}}': character.basicInfo.name,
        '{{character}}': characterJson,
        '{{personaName}}': playerPersona.basicInfo.name,
        '{{persona}}': playerPersonaJson,
        '{{relationship}}': relationshipJson,
        '{{world}}': worldSection,
        '{{style}}': styleSection,
        '{{summaries}}': summariesSection,
        '{{instructions}}': actingInstructions || ""
    };

    for (const [key, value] of Object.entries(substitutions)) {
        prompt = prompt.split(key).join(value);
    }

    return prompt;
};

export const getChatPrompt = (character: Character) => `Continue the conversation impersonating ${character.basicInfo.name}`;


