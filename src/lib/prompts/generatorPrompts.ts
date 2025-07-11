export const WORLD_JSON_STRUCTURE = `{
  "world": string; // A detailed description of the world.
}`;

export const generateWorldPrompt = (worldDescription: string) => `
You are a world-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${WORLD_JSON_STRUCTURE}

Generate a detailed world description based on the following input. The output should be a JSON object with a single key, "world", containing a string value of the generated world description.

Input World Description: ${worldDescription}

JSON Output:
`;

export const CHARACTER_JSON_STRUCTURE = `{
  "basicInfo": {
    "name": string,
    "role": string,
    "faction": string,
    "avatar": string,
    "reputation": string,
    "background": string,
    "firstImpression": string,
    "appearance": string
  },
  "personality": {
    "openness": number, // An integer between -100 and 100.
    "conscientiousness": number, // An integer between -100 and 100.
    "extraversion": number, // An integer between -100 and 100.
    "agreeableness": number, // An integer between -100 and 100.
    "neuroticism": number // An integer between -100 and 100.
  },
  "relationshipToPlayer": {
    "affinity": number, // An integer between -100 and 100.
    "notes": string
  },
  "preferences": {
    "attractedToTraits": string[],
    "dislikesTraits": string[],
    "gossipTendency": "low" | "medium" | "high" // Must be one of "low", "medium", or "high".
  }
}`;

export const generateCharacterPrompt = (characterDescription: string, worldDescription: string) => `
You are a character-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${CHARACTER_JSON_STRUCTURE}

Generate a detailed character profile based on the following input. Ensure all fields are populated with relevant and creative information. The personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) should be integers between -100 and 100. The relationship affinity should also be an integer between -100 and 100. The gossipTendency must be one of "low", "medium", or "high".

Input Character Description: ${characterDescription}

World Description: ${worldDescription}

JSON Output:
`;

export const PERSONA_JSON_STRUCTURE = `{
  "playerProfile": {
    "name": string,
    "alias": string,
    "reputation": string,
    "background": string,
    "firstImpression": string,
    "role": string,
    "faction": string,
    "avatar": string,
    "appearance": string
  }
}`;

export const generatePersonaPrompt = (personaDescription: string) => `
You are a player persona-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${PERSONA_JSON_STRUCTURE}

Generate a detailed player persona profile based on the following input. Ensure all fields are populated with relevant and creative information.

Input Persona Description: ${personaDescription}

JSON Output:
`;