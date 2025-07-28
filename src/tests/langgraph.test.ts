import { langGraphApp } from "../lib/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

describe("LangGraph Integration", () => {
  it("should process a chat message through the graph", async () => {
    const initialState = {
      chatHistory: [],
      currentInput: "Hello, world!",
    };

    const finalState = await langGraphApp.invoke(initialState, {
      configurable: {
        thread_id: "test-thread-id",
      },
    });

    expect(finalState.chatHistory.length).toBe(2); // HumanMessage + AIMessage
    expect(finalState.chatHistory[0]).toBeInstanceOf(HumanMessage);
    expect(finalState.chatHistory[0].content).toBe("Hello, world!");
    expect(finalState.chatHistory[1]).toBeInstanceOf(AIMessage);
    expect(typeof finalState.chatHistory[1].content).toBe("string");
    expect(finalState.chatHistory[1].content.length).toBeGreaterThan(0);
  }, 30000); // Increase timeout for LLM calls
});
