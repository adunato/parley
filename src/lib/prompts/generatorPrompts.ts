export const WORLD_JSON_STRUCTURE = `{
  "world": string; // A detailed description of the world.
}`;

export const generateWorldPrompt = (worldDescription: string) => {
    let prompt = `
You are a world-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${WORLD_JSON_STRUCTURE}

Generate a detailed world description. The output should be a JSON object with a single key, "world", containing a string value of the generated world description.`;

    if (worldDescription) {
        prompt += `\n\nInput World Description: ${worldDescription}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};


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

Generate a detailed AI style. The output should be a JSON object with a single key, "aiStyle", containing a string value of the generated AI style.`;

    if (aiStyleDescription) {
        prompt += `\n\nInput AI Style Description: ${aiStyleDescription}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};

export const AI_STYLE_JSON_STRUCTURE = `{
  "aiStyle": string; // A detailed description of the AI's writing style.
}`;
