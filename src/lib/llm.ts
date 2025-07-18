import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from '@langchain/core/messages';
import JSON5 from 'json5';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export function getLlm(modelName: string = "deepseek/deepseek-chat") {
  return new ChatOpenAI({
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter-examples",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
    },
    model: modelName,
  });
}

export async function generateJSON(prompt: string, modelName?: string): Promise<any> {
  const llm = getLlm(modelName);
  const result = await llm.generate([[new HumanMessage(prompt)]]);
  const responseContent = result.generations[0][0].text;
  console.log("Raw LLM response:", responseContent);

  try {
    return JSON5.parse(
      responseContent.slice(
        responseContent.search(/[\{\[]/),
        Math.max(responseContent.lastIndexOf('}'), responseContent.lastIndexOf(']')) + 1
      )
    );
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    console.error("Original response from LLM:", responseContent);
    throw new Error("Could not parse JSON from LLM response.");
  }
}