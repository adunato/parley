export const generateWorldPrompt = (worldDescription: string) => `
Generate a detailed world description based on the following input. The output should be a JSON object with a single key, "world", containing a string value of the generated world description.

Input World Description: ${worldDescription}

JSON Output:
`;
