import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const llm = new ChatOpenAI({
    configuration: {
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter-examples",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
    },
    model: "mistralai/mistral-large",
});

async function main() {
    const response = await llm.invoke("What is the capital of France?");
    console.log(response);
}

main();