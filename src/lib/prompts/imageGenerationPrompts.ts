export const IMAGE_DESCRIPTION_JSON_STRUCTURE = `{  "imageDescription": string; // A detailed description of the character or persona for image generation.}`;

export const generateImageDescriptionPrompt = (characterOrPersonaData: any) => {
    const { name, age, role, appearance } = characterOrPersonaData.basicInfo;
    const characterDescription = `Name: ${name || 'N/A'}\nAge: ${age || 'N/A'}\nRole: ${role || 'N/A'}\nAppearance: ${appearance || 'N/A'}`;
    let prompt = `
You are an AI assistant that generates detailed image descriptions for character or persona avatars. Your responses MUST be a JSON object conforming to the following structure:
${IMAGE_DESCRIPTION_JSON_STRUCTURE}

Generate a detailed image description based on the following character or persona data. Focus on visual aspects such as appearance, clothing, and any distinguishing features that would be relevant for generating an avatar. The description should be concise but rich in detail.
The format of the input data should be compliant with image generation requirements (i.e. Stable Diffusion). 
As an example, input appearance description as: "Eryndor is tall and lean, with shoulder-length auburn hair tied back in a loose braid. He wears a dark blue scholar's robe embroidered with silver runes, and a pendant bearing the symbol of Luminara rests on his chest. His hands are often stained with ink from hours of meticulous note-taking." should translate into the following image generation prompt: "eryndor raganor, 27-year-old, auburn hair, dark blue robe, ink, luminara, note-taking, scholar's robe, shoulder-length, tall, lean"
Be sure to include the name, age, role, and appearance of the character or persona in the description.

--- CHARACTER/PERSONA DATA ---
${characterDescription}
------------------------------
`;


    prompt += `\n\nJSON Output:\n`;

    return prompt;
};