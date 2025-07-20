export const IMAGE_DESCRIPTION_JSON_STRUCTURE = `{  "imageDescription": string; // A detailed description of the character or persona for image generation.}`;

export const generateImageDescriptionPrompt = (characterOrPersonaData: any, aiStyle?: string) => {
    let prompt = `
You are an AI assistant that generates detailed image descriptions for character or persona avatars in a text adventure game. Your responses MUST be a JSON object conforming to the following structure:
${IMAGE_DESCRIPTION_JSON_STRUCTURE}

Generate a detailed image description based on the following character or persona data. Focus on visual aspects such as appearance, clothing, and any distinguishing features that would be relevant for generating an avatar. The description should be concise but rich in detail.

--- CHARACTER/PERSONA DATA ---
${JSON.stringify(characterOrPersonaData, null, 2)}
------------------------------
`;

    if (aiStyle) {
        prompt += `\n\nAI Style: ${aiStyle}`;
    }

    prompt += `\n\nJSON Output:\n`;

    return prompt;
};