# OBJECTIVE

Integrate LangGraph into the game.

# REQUIREMENTS

Import LangGraph ts/js library into the game project.
Create a test module that uses LangGraph to generate a chat prompt.

# DESIGN

*   **LangGraph Integration Strategy:** LangGraph will be integrated on the backend within a new API route (`src/app/api/langgraph-chat/route.ts`) to manage the conversational flow and prompt generation. This ensures the frontend remains focused on UI, while the server handles the complex state management and LLM interactions via LangGraph.
*   **Chat Prompt Generation Flow:** LangGraph will define a state machine for generating chat prompts. This will involve nodes for:
    *   **Initial Prompt Construction:** Combining character context, current story state, and initial user input.
    *   **Contextualization/Refinement:** Adding more detailed context based on game state or character relationships, potentially using LangGraph's `tool` and `agent` concepts.
    *   **LLM Call:** Passing the refined prompt to the LLM (e.g., using `@langchain/openai` or `@langchain/anthropic` with LangGraph).
    *   **Response Processing:** Handling the LLM's response, updating the game state, and potentially using LangGraph's `checkpointer` for persistence (e.g., `MemorySaver` or `PostgresSaver`).
*   **Module Structure:** A new utility module (`src/lib/langgraph.ts`) will encapsulate the LangGraph graph definition, node implementations, and related logic. The API route will import and utilize this module.

# IMPLEMENTATION STEPS

1.  **Install LangGraph and Dependencies:** Add `@langchain/langgraph` and relevant LLM integration packages (e.g., `@langchain/openai`) as dependencies to `package.json`.
2.  **Define LangGraph State:** Create a TypeScript interface for the LangGraph state, including elements like `chatHistory`, `currentInput`, `characterContext`, and `storyState`.
3.  **Implement LangGraph Nodes:** Develop functions for each node in the chat prompt generation graph (e.g., `constructPromptNode`, `callLLMNode`, `processResponseNode`). Consider using LangGraph's `tool` and `createReactAgent` for more complex agent behaviors.
4.  **Assemble LangGraph Graph:** Use the LangGraph API to define the graph, connecting nodes with edges based on the desired conversational flow. Explore using `createSupervisor` for multi-agent orchestration if needed.
5.  **Create API Route:** Create `src/app/api/langgraph-chat/route.ts` to expose an endpoint for interacting with the LangGraph-powered chat. This route will initialize and invoke the LangGraph application.
6.  **Integrate with Existing LLM:** Ensure the LangGraph flow correctly utilizes the existing LLM integration (e.g., `src/lib/llm.ts`) or directly integrates with LLM packages via LangGraph.
7.  **Implement State Persistence (Optional but Recommended):** Consider integrating a checkpointer (e.g., `MemorySaver` for in-memory or `PostgresSaver` for database persistence) to manage conversation history and game state within LangGraph.
8.  **Create Test Module:** Develop a test file (e.g., `src/tests/langgraph.test.ts`) that:
    *   Mocks necessary dependencies (e.g., LLM responses).
    *   Calls the LangGraph API route or directly tests the LangGraph module.
    *   Asserts the structure and content of the generated prompts and responses.
9.  **Build Project:** Run `npm run build` to verify that all changes compile without errors.

**IMPORTANT:** DO NOT MODIFY THE EXISTING CHAT FUNCTIONALITY. Focus on LangGraph integration and state management. We will integrate LangGraph into the existing chat functionality later as a separate feature.