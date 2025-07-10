import { ChatOpenAI } from "@langchain/openai";

const OPENROUTER_API_KEY = "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";
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