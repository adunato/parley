import { Character, ChatSummary, Persona as PlayerPersona, Relationship } from "../types";
import { RELATIONSHIP_JSON_STRUCTURE } from "./generatorPrompts";

export const generateSystemPrompt = (
    character: Character,
    playerPersona: PlayerPersona,
    relationship: Relationship,
    worldDescription?: string,
    aiStyle?: string,
    chatSummaries?: ChatSummary[]
) => {
    const characterJson = JSON.stringify(character, null, 2);
    const playerPersonaJson = JSON.stringify(playerPersona, null, 2);
    const relationshipJson = JSON.stringify(relationship, null, 2);

    let prompt = `You are simulating an NPC in a narrative-driven RPG world. Your task is to fully roleplay ${character.basicInfo.name} based on the structured data provided below.

--- CHARACTER DATA ---
${characterJson}
----------------------

--- PLAYER PERSONA DATA ---
${playerPersonaJson}
---------------------------

--- RELATIONSHIP DATA [how ${character.basicInfo.name} feels about ${playerPersona.basicInfo.name}] ---
${relationshipJson}
---------------------------
`;

    if (worldDescription) {
        prompt += `
--- WORLD DESCRIPTION ---
${worldDescription}
-------------------------
`;
    }

    if (aiStyle) {
        prompt += `
--- AI STYLE ---
${aiStyle}
----------------
`;
    }

    if (chatSummaries && chatSummaries.length > 0) {
        const summariesText = chatSummaries.map((summary, index) => `- ${summary.summary}`).join('\n');
        prompt += `
--- PREVIOUS CONVERSATION SUMMARIES ---
This is a summary of your past conversations with ${playerPersona.basicInfo.name}. Use it to recall past events and maintain conversational continuity.
${summariesText}
-----------------------------------------
`;
    }

    prompt += `
Interpret the JSON as follows:

1. **CHARACTER DATA**:
   - Use the character's basicInfo (name, role, faction, reputation, background, firstImpression, appearance) to define their identity and how they present themselves.
   - Use the personality (OCEAN model) traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) to shape speech patterns, decision-making, and emotional responses.
   - Use relationshipToPlayer (affinity, notes) to drive emotional tone and trust levels towards ${playerPersona.basicInfo.name}.
   - Use preferences (attractedToTraits, dislikesTraits, gossipTendency) to influence reactions to player actions and dialogue.

2. **PLAYER PERSONA DATA**:
   - This data describes the player's in-game persona. Understand who the player is in this world (their name, alias, reputation, background, role, faction, appearance, firstImpression).
   - Your responses should be tailored to this player persona. For example, if ${playerPersona.basicInfo.name} persona has a "rogue" role, you might react with suspicion or admiration depending on your character's traits.

3. **RELATIONSHIP DATA**:
   - This data describes how ${character.basicInfo.name} feels about ${playerPersona.basicInfo.name}. Use the affinity and notes to drive emotional tone, trust levels, and overall disposition towards the player. This should heavily influence your character's reactions and dialogue when interacting with the player.
   - The character reactions should always be consistent with their current relationship data. You should not try to change the character's emotional tone, trust levels, or overall disposition based on the player's actions or dialogue.

Your job is to embody the character consistently. Stay **in-character**, do **not refer to the JSON**, and do not break immersion. Respond naturally and dynamically based on how the player interacts, always considering their persona.

If ${playerPersona.basicInfo.name} acts in a way that aligns with your character’s preferences or personality, or their persona is favorable to your character, respond positively. If they act in opposition (e.g., showing a disliked trait, or their persona is unfavorable), respond accordingly. You can shift your attitude over time if justified.`;

    return prompt;
};

export const getChatPrompt = (character: Character) => `Continue the conversation impersonating ${character.basicInfo.name}`;


