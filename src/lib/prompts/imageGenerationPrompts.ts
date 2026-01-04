export const IMAGE_DESCRIPTION_JSON_STRUCTURE = `{  "imageDescription": string; // A detailed description of the character or persona for image generation.}`;

import { PromptStore } from '../store/promptStore';

export const generateImageDescriptionPrompt = (characterOrPersonaData: any) => {
    const { name, age, role, appearance } = characterOrPersonaData.basicInfo;
    const characterDescription = `Name: ${name || 'N/A'}\nAge: ${age || 'N/A'}\nRole: ${role || 'N/A'}\nAppearance: ${appearance || 'N/A'}`;

    let prompt = PromptStore.getPrompt('avatar_desc');

    prompt = prompt.split('{{jsonStructure}}').join(IMAGE_DESCRIPTION_JSON_STRUCTURE);
    prompt = prompt.split('{{characterOrPersonaData}}').join(characterDescription);

    return prompt;
};