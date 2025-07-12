import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from '@langchain/core/messages';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export const llm = new ChatOpenAI({
    configuration: {
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter-examples",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
    },
    model: "mistralai/mistral-large",
});

export async function generateJSON(prompt: string): Promise<any> {
  const result = await llm.generate([[new HumanMessage(prompt)]]);
  const responseContent = result.generations[0][0].text;

  // Attempt to find a JSON block marked with ```json
  const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
  let jsonText = responseContent;

  if (jsonMatch && jsonMatch[1]) {
    jsonText = jsonMatch[1];
  } else {
    // If no markdown block is found, find the content between the first { and the last }
    const firstBrace = responseContent.indexOf('{');
    const lastBrace = responseContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = responseContent.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    // Clean the extracted JSON text
    const cleanedJson = jsonText      .replace(/\/\/[^\n]*/g, ''); // Remove comments

    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    console.error("Original response from LLM:", responseContent);
    throw new Error("Could not parse JSON from LLM response.");
  }
}