import { Character, ChatSummary, Persona as PlayerPersona, Relationship } from "../types";
import { RELATIONSHIP_JSON_STRUCTURE } from "./generatorPrompts";
import { PromptStore } from "../store/promptStore";
import { getOceanDescription } from "../../../config/ocean-traits";
import { getPrqcDescription } from "../../../config/prqc-traits";

export const generateSystemPrompt = (
    character: Character,
    playerPersona: PlayerPersona,
    relationship: Relationship,
    template: string,
    worldDescription?: string,
    aiStyle?: string,
    chatSummaries?: ChatSummary[],
    actingInstructions?: string,
    locationDescription?: string
) => {
    const characterJson = JSON.stringify(character, null, 2);

    // Use persona.basicInfo to match character.basicInfo structure
    const personaBasicInfoJson = JSON.stringify(playerPersona.basicInfo, null, 2);

    // Keep full persona for legacy/compatibility if needed, but we will prefer basicInfo
    const playerPersonaJson = JSON.stringify(playerPersona, null, 2);

    // Create a new relationship object with descriptive values instead of raw numbers for PRQC
    const relationshipDescriptive = {
        ...relationship,
        satisfaction: `${getPrqcDescription('satisfaction', relationship.satisfaction)}`,
        commitment: `${getPrqcDescription('commitment', relationship.commitment)}`,
        intimacy: `${getPrqcDescription('intimacy', relationship.intimacy)}`,
        trust: `${getPrqcDescription('trust', relationship.trust)}`,
        passion: `${getPrqcDescription('passion', relationship.passion)}`,
    };

    // Remove chat_summaries from the relationship object to avoid duplication with the main summaries section
    if (relationshipDescriptive.chat_summaries) {
        delete relationshipDescriptive.chat_summaries;
    }

    const relationshipJson = JSON.stringify(relationshipDescriptive, null, 2);

    const characterBasicInfoJson = JSON.stringify(character.basicInfo, null, 2);


    const characterPersonalityDescriptive = Object.entries(character.personality).map(([trait, value]) => {
        return `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${getOceanDescription(trait as any, value)}`;
    }).join('\n');

    const characterIdealMatchDescriptive = Object.entries(character.idealMatch).map(([trait, value]) => {
        return `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${getOceanDescription(trait as any, value)}`;
    }).join('\n');

    let worldSection = '';
    if (worldDescription) {
        worldSection = `--- WORLD DESCRIPTION ---\n${worldDescription}\n-------------------------`;
    }

    let locationSection = '';
    if (locationDescription) {
        locationSection = `--- LOCATION DESCRIPTION ---\n${locationDescription}\n----------------------------`;
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

    // Default template fallback: Use provided template first, then the stored default
    let prompt = template || PromptStore.getPrompt('chat_system');

    const substitutions: Record<string, string> = {
        '{{characterName}}': character.basicInfo.name,
        '{{character}}': characterJson,
        '{{characterBasicInfo}}': characterBasicInfoJson,
        '{{characterPersonality}}': characterPersonalityDescriptive,
        '{{characterIdealMatch}}': characterIdealMatchDescriptive,
        '{{personaName}}': playerPersona.basicInfo.name,
        '{{persona}}': playerPersonaJson,
        '{{personaBasicInfo}}': personaBasicInfoJson,
        '{{relationship}}': relationshipJson,
        '{{world}}': worldSection,
        '{{locationDescription}}': locationSection,
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
