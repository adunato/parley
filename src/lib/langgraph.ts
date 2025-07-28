import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MemorySaver, entrypoint, START } from "@langchain/langgraph";
import { getLlm } from "../lib/llm";

export interface LangGraphState {
  chatHistory: BaseMessage[];
  currentInput: string;
}

// Node to construct the prompt
async function constructPromptNode(state: LangGraphState) {
  console.log("Constructing prompt...");
  // For now, just add the current input as a HumanMessage to chat history
  const newMessages = state.chatHistory.concat(new HumanMessage(state.currentInput));
  return { ...state, chatHistory: newMessages };
}

// Node to call the LLM
async function callLLMNode(state: LangGraphState) {
  console.log("Calling LLM...");
  const llm = getLlm();
  const response = await llm.invoke(state.chatHistory);
  return { ...state, chatHistory: state.chatHistory.concat(new AIMessage(response.content as string)) };
}

// Node to process the LLM's response
async function processResponseNode(state: LangGraphState) {
  console.log("Processing LLM response...");
  // In a real scenario, you might parse the LLM response for game actions or state updates
  return { ...state };
}

// Assemble the graph
export const graphBuilder = new StateGraph<LangGraphState>({
  channels: {
    chatHistory: {
      value: (x: BaseMessage[], y: BaseMessage[]) => y,
      default: () => [],
    },
    currentInput: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    
  },
})
  .addNode("constructPrompt", constructPromptNode)
  .addNode("callLLM", callLLMNode)
  .addNode("processResponse", processResponseNode)
  .addEdge(START, "constructPrompt")
  .addEdge("constructPrompt", "callLLM")
  .addEdge("callLLM", "processResponse")
  .compile();

export const langGraphApp = entrypoint({
  name: "langGraphApp",
  checkpointer: new MemorySaver(), // Using MemorySaver for now, as discussed
}, async (input: LangGraphState) => {
  const finalState = await graphBuilder.invoke(input);
  return finalState;
});