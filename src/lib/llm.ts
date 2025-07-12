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
  let parsedResult;
  try {
    parsedResult = JSON.parse(responseContent);
  } catch (e) {
    const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("Could not parse JSON from LLM response.");
    }
    parsedResult = JSON.parse(jsonMatch[1]);
  }
  return parsedResult;
}