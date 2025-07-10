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
    "openness": number,
    "conscientiousness": number,
    "extraversion": number,
    "agreeableness": number,
    "neuroticism": number
  },
  "relationshipToPlayer": {
    "affinity": number,
    "notes": string
  },
  "preferences": {
    "attractedToTraits": string[],
    "dislikesTraits": string[],
    "gossipTendency": "low" | "medium" | "high"
  }
}`;

export const generateCharacterPrompt = (characterDescription: string) => `
You are a character-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${CHARACTER_JSON_STRUCTURE}

Generate a detailed character profile based on the following input. Ensure all fields are populated with relevant and creative information. The personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) should be integers between -100 and 100. The relationship affinity should also be an integer between -100 and 100. The gossipTendency must be one of "low", "medium", or "high".

Input Character Description: ${characterDescription}

JSON Output:
`;