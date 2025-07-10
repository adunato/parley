import { Character } from "./entityStore";

const CHARACTER_JSON_STRUCTURE = `{
  "id": string;
  "name": string;
  "description": string;
  "personalityTraits": string[];
  "motives": string[];
  "affiliation": string | null;
  "sceneIntroduced": string;
}`;

export const CHARACTER_SYSTEM_PROMPT = `You are a helpful assistant. Your responses MUST be a JSON object conforming to the Character type. The JSON object must have the following structure:
${CHARACTER_JSON_STRUCTURE}
Ensure all fields are present and correctly typed.`;

export const CREATE_CHARACTER_PROMPT = (
  characterId: string,
  storySummary: string,
  currentLocationDescription: string
) => `
Based on the following story summary and current location description, create a detailed profile for a new character with the ID "${characterId}".

Story Summary: ${storySummary}

Current Location Description: ${currentLocationDescription}

Provide the character's name, a brief description, personalityTraits (as an array of strings), motives (as an array of strings), and their affiliation (or null if none). The character's ID should be "${characterId}".
`;
