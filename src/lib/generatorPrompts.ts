const WORLD_JSON_STRUCTURE = `{
  "world": string; // A detailed description of the world.
}`;

export const generateWorldPrompt = (worldDescription: string) => `
You are a world-building AI for a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${WORLD_JSON_STRUCTURE}

Generate a detailed world description based on the following input. The output should be a JSON object with a single key, "world", containing a string value of the generated world description.

Input World Description: ${worldDescription}

JSON Output:
`;
