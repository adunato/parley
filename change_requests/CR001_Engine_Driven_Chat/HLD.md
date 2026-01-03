# High Level Design: Hybrid Relationship Engine Implementation (CR001)

## 1. Context & Scope
The original "Engine Driven Chat" (CR001) which proposed a per-message classification loop is being superseded by the **Hybrid Relationship Engine v2.0**. 

**Reference Design:** `docs/High-Level Design_ Hybrid Relationship Engine v2.0.md`

This document outlines the **delta** between the current codebase and the target v2.0 state. It describes the specific modules and logic flows that must be implemented to achieve the "Director / Actor / Analyst" cycle.

## 2. Current Codebase State
*   **Architecture:** Simple Request/Response Loop.
*   **Prompt Generation:** `src/app/api/chat/route.ts` calls `generateSystemPrompt` which injects all character/persona/world data into a large template.
*   **State:** Relationship state is passed from the client in the request body. No server-side persistence or mutation logic currently exists in the chat route.
*   **Logic:** Purely LLM-driven. No deterministic guardrails based on state thresholds.

## 3. High-Level Architecture Changes

The monolithic "Chat" process will be split into three distinct components:

### 3.1 The Director (Pre-Scene / Setup)
*   **Objective:** Replace the generic `generateSystemPrompt` with a rigid Rule Engine.
*   **New Module:** `lib/engine/director.ts`
*   **Logic:**
    *   Taking `OCEAN` and `PRQC` (Relationship) stats as input.
    *   Querying a static `Instruction Catalogue`.
    *   Outputting a **System Prompt** composed of specific, mandatory instructions (e.g., "Trust is < 20, do not believe user").
*   **Impact on `route.ts`:** The API will now call the Director to get the system prompt logic, rather than using a generic template.

### 3.2 The Actor (Real-Time Chat)
*   **Objective:** Lightweight, standard LLM interaction constrained by the Director.
*   **Modifications to `src/app/api/chat/route.ts`:**
    *   **Input:** Uses the Director-generated prompt.
    *   **Output Monitoring:** The stream must be monitored for the `[EVENT: TRIGGER_ASSESSMENT]` token.
    *   **Emergency Brake:** If the token is detected, the stream must support a mechanism to halt/notify the client to trigger an immediate analysis (though for Phase 1, we may just log this).

### 3.3 The Analyst & Judge (Post-Scene)
*   **Objective:** Asynchronous state updates.
*   **New API Route:** `/api/engine/process-scene`
*   **New Module:** `lib/engine/analyst.ts`
    *   Sends chat history to LLM.
    *   Returns a **Scene Report** (JSON with aggregate traits).
*   **New Module:** `lib/engine/judge.ts`
    *   Takes Scene Report + Current State.
    *   Calculates mathematical operational updates to PRQC.
*   **Frontend Impact:** Client needs to decide when a "Scene" ends (e.g., manual button user flow or session end) and call this endpoint.

## 4. Data Structures

### 4.1 Instruction Catalogue (`lib/engine/rules.ts`)
A static typescript object/configuration containing the Rules defined in `MASTER CATALOGUE OF LLM ACTING RULES.md`.

```typescript
type Rule = {
  id: string;
  condition: (character: Ocean, relation: Prqc) => boolean;
  instruction: string;
}
```

### 4.2 Sensitivity Matrix (`lib/engine/math.ts`)
Configuration defining how specific aggregate traits (e.g., "Aggression", "Flirtation") map to PRQC updates based on Character personality.

## 5. Implementation Roadmap
See `Implementation-Plan.md` for the phased execution steps.