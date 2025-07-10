import { ChatOpenAI } from "@langchain/openai";

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