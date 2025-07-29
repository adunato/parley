# 📄 Technical Specification: LangGraph API Server Integration

## 🎯 Objective

Integrate a LangGraph-powered state machine into an existing JS/TS project and expose it via a local HTTP server for:

* Invoking the graph with JSON input.
* Returning the resulting graph state.
* Enabling compatibility with LangGraph Studio for visualization/debugging.

---

## 🧱 System Architecture

* **Language:** TypeScript or JavaScript
* **Runtime:** Node.js
* **Web Server:** Express.js
* **Graph Engine:** `@langchain/langgraph`
* **Optional Observability:** LangSmith or local `.json` logging
* **Frontend (optional):** LangGraph Studio

---

## 📁 File Structure Example

```
project-root/
│
├── src/
│   ├── lib/
│   │   └── llm.ts              # your LLM setup
│   ├── graph/
│   │   └── langGraphApp.ts     # graph definition and entrypoint
│   └── server/
│       └── apiServer.ts        # Express server exposing the graph
│
├── package.json
└── tsconfig.json
```

---

## 🔧 Implementation Steps

### 1. **Create/Import LangGraph**

Define or import the LangGraph app using `StateGraph` and `entrypoint`.

```ts
// src/graph/langGraphApp.ts

import { StateGraph, entrypoint, START, MemorySaver } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getLlm } from "../lib/llm";

export interface LangGraphState {
  chatHistory: BaseMessage[];
  currentInput: string;
}

const constructPromptNode = async (state: LangGraphState) => {
  const newMessages = state.chatHistory.concat(new HumanMessage(state.currentInput));
  return { ...state, chatHistory: newMessages };
};

const callLLMNode = async (state: LangGraphState) => {
  const llm = getLlm();
  const response = await llm.invoke(state.chatHistory);
  return { ...state, chatHistory: state.chatHistory.concat(new AIMessage(response.content as string)) };
};

const processResponseNode = async (state: LangGraphState) => {
  return { ...state }; // Optional post-processing
};

const graph = new StateGraph<LangGraphState>({
  channels: {
    chatHistory: {
      value: (x, y) => y,
      default: () => [],
    },
    currentInput: {
      value: (x, y) => y,
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

export const langGraphApp = entrypoint({ name: "langGraphApp", checkpointer: new MemorySaver() }, async (input) => {
  return await graph.invoke(input);
});
```

---

### 2. **Create API Server**

```ts
// src/server/apiServer.ts

import express from "express";
import bodyParser from "body-parser";
import { langGraphApp } from "../graph/langGraphApp";

const app = express();
const PORT = 2024;

app.use(bodyParser.json());

app.post("/invoke", async (req, res) => {
  try {
    const result = await langGraphApp.invoke(req.body);
    res.json(result);
  } catch (err) {
    console.error("LangGraph error:", err);
    res.status(500).json({ error: "Graph execution failed." });
  }
});

// Optional: expose graph structure to LangGraph Studio
app.get("/.well-known/graph", async (_req, res) => {
  const graphJson = await langGraphApp.getGraph().toJSON();
  res.json(graphJson);
});

app.listen(PORT, () => {
  console.log(`✅ LangGraph API server running at http://localhost:${PORT}`);
});
```

---

## 🧪 Testing

* Start the server: `npx ts-node src/server/apiServer.ts`
* Test with Postman or curl:

```bash
curl -X POST http://localhost:2024/invoke \
  -H "Content-Type: application/json" \
  -d '{"chatHistory": [], "currentInput": "Hi there!"}'
```

---

## 🔍 Studio Integration

* Launch Studio:
  `https://smith.langchain.com/studio/?baseUrl=http://localhost:2024`
* Studio will:

    * Read `.well-known/graph`
    * Invoke `/invoke` endpoint with your input

---

## 📦 Dependencies

```bash
npm install express body-parser @langchain/langgraph @langchain/core
npm install -D ts-node typescript
```

---

## ✅ Deliverables

* `langGraphApp.ts`: your graph definition
* `apiServer.ts`: a clean, minimal API server
* Working `/invoke` endpoint
* Compatibility with LangGraph Studio