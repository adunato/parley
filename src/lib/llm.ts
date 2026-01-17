import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from '@langchain/core/messages';
import JSON5 from 'json5';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export function getLlm(modelName: string = "deepseek/deepseek-chat") {
  return new ChatOpenAI({
    apiKey: OPENROUTER_API_KEY,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://parley.vercel.app", // Updated to app specific
        "X-Title": "Parley",
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

import { z } from 'zod';
import { SystemMessage } from "@langchain/core/messages";

export async function generateObject<T>(options: {
  prompt: string;
  schema: z.ZodType<T>;
  modelName?: string;
  system?: string;
}): Promise<{ object: T }> {
  const llm = getLlm(options.modelName);
  // Using jsonMode to ensure compatibility with all OpenRouter providers 
  // without enforcing "tool calling" data policies.
  const structuredLlm = llm.withStructuredOutput(options.schema as any, {
    method: "jsonMode",
  });

  const messages = [];
  if (options.system) {
    messages.push(new SystemMessage(options.system));
  }
  messages.push(new HumanMessage(options.prompt));

  try {
    const result = await structuredLlm.invoke(messages);
    return { object: result as any };
  } catch (error) {
    console.error("Error in generateObject:", error);
    throw error;
  }
}