const JSON_STRUCTURE = `{
  "currentLocationId"?: string;
  "conversationStatus": "STARTED" | "CONTINUED" | "ENDED" | "NONE";
  "characterId"?: string;
  "sceneDescription": string; // Always provide a scene description.
  "dialogue"?: string; // Only include if a character is speaking.
  "choices": [
    {
      "text": string;
      "actionType": "DIALOGUE_RESPONSE" | "SCENE_ACTION" | "LEAVE_CONVERSATION" | "TRANSITION_SCENE";
      "targetId"?: string;
    }
  ];
}`;

export const SYSTEM_PROMPT = `You are a text adventure game master. Your responses MUST be a JSON object conforming to the LLMResponse interface. The JSON object must have the following structure:
${JSON_STRUCTURE}
Ensure all fields are present and correctly typed. The scene description should be separate from the dialogue. Dialogue should only include the character's response. The scene description should not include the character's response.`;

export const START_PROMPT = "Generate a short, fictional story to start a text adventure game. As this is the first scene of the game, do not include any characters in this scene.";

export const MAIN_USER_PROMPT = (storySummary: string, choice: string, currentLocationId: string, inConversation: boolean, currentCharacterId: string | undefined, locationDetails?: any, characterDetails?: any) => {
  const summaryPart = storySummary ? `Story so far: ${storySummary}\n\n` : '';
  const locationDetailsPart = locationDetails ? `\n\nUse the following Location Details to describe the current location: ${JSON.stringify(locationDetails)}` : '';
  const characterDetailsPart = characterDetails ? `\n\nUse the following Character Details to describe the character and inform their dialogue/actions: ${JSON.stringify(characterDetails)}` : '';
  const choicePart = `User chooses: ${choice}. Current location: ${currentLocationId}. In conversation: ${inConversation}. currentCharacterId: ${currentCharacterId || 'None'}.`;
  return `${summaryPart}${choicePart}${locationDetailsPart}${characterDetailsPart}\n\nGenerate the next part of the story based on the user's choice and the provided context.`;
};



export const SUMMARIZE_PROMPT = (sceneDescription: string, dialogue: string | undefined, userChoice: string) => `Summarize the following scene, dialogue, and user choice into a single, concise paragraph for the story history.
Scene: ${sceneDescription}
Dialogue: ${dialogue || 'None'}
User Choice: ${userChoice}
`;

export const PREDICT_NEXT_LOCATION_JSON_STRUCTURE = `{
  "predictedLocationId": string;
  "predictedCharacterId"?: string;
}`;

export const PREDICT_NEXT_LOCATION_PROMPT = (storySummary: string, choice: string, currentLocationId: string, inConversation: boolean, currentCharacterId?: string) => {
  const summaryPart = storySummary ? `Story so far: ${storySummary}

` : '';
  const choicePart = `User chooses: ${choice}. Current location: ${currentLocationId}. In conversation: ${inConversation}. Current character: ${currentCharacterId || 'None'}.`;
  return `Based on the following game state, predict the ID of the next location and the character ID that might become central to the location. Only change the location ID if the user has chosen to leave the current location. If current character remains in the same location, do not change the character ID. Your response MUST be a JSON object conforming to the following structure:
${PREDICT_NEXT_LOCATION_JSON_STRUCTURE}

${summaryPart}${choicePart}

Provide only the JSON object.`;
};

export const LOCATION_DETAILS_JSON_STRUCTURE = `{
  "locationName": string;
  "detailedDescription": string;
}`;

export const GENERATE_LOCATION_DETAILS_PROMPT = (locationId: string, storySummary: string, currentLocationDescription: string) => `Generate detailed information for a new location with ID "${locationId}".

Story Summary: ${storySummary}
Previous Location Description: ${currentLocationDescription}

Your response MUST be a JSON object conforming to the following structure:
${LOCATION_DETAILS_JSON_STRUCTURE}

Provide only the JSON object.`;
