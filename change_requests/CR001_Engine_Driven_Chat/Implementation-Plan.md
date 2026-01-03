# Implementation Plan: Hybrid Relationship Engine v2.0

This plan outlines the steps to implement the architecture defined in `docs/High-Level Design_ Hybrid Relationship Engine v2.0.md` and the changes described in `change_requests/CR001_Engine_Driven_Chat/HLD.md`.

## User Review Required
> [!IMPORTANT]
> **Breaking Change:** The logic for generating system prompts creates a hard dependency on strict `OCEAN` and `PRQC` stats. Existing characters without these stats may default to "neutral" or broken behavior. Verification of data migration or default fallbacks is needed.

## Proposed Changes

### Phase 1: The Director (Rules & Prompting)
**Goal:** Replace the current generic system prompt with a deterministic, rule-based "Guardrail" system.

#### [NEW] `src/lib/engine/rules.ts`
- Define `InstructionCatalogue` constant containing the rules from the Master Catalogue.
- Define Types for `OCEAN`, `PRQC`, and `Rule`.

#### [NEW] `src/lib/engine/director.ts`
- Implement `GenerateSystemPrompt(character, relationship)` function.
- Logic: Iterate through `InstructionCatalogue`, evaluate IF conditions against stats, append THEN instructions.

#### [MODIFY] `src/app/api/chat/route.ts`
- Replace `generateSystemPrompt` call with the new `Director.GenerateSystemPrompt`.
- Ensure character/relationship state passed from client conforms to the new Type requirements.

---

### Phase 2: The Analyst & Judge (Math Engine)
**Goal:** Implement the post-scene feedback loop that updates relationship stats.

#### [NEW] `src/lib/engine/analyst.ts`
- Implement `AnalyzeScene(chatHistory)` function.
- Define prompt for LLM to summarize conversation and extract `AggregateTraits` (e.g., Aggression: 0.8).
- Output: `SceneReport` JSON.

#### [NEW] `src/lib/engine/judge.ts`
- Implement `CalculateImpact(sceneReport, character, currentRelationship)` function.
- Define `SensitivityMatrix` (how Traits affect specific PRQC values).
- Logic: Apply multipliers and return `RelationShipDelta`.

#### [NEW] `src/app/api/engine/process-scene/route.ts`
- Endpoint to accept a finished chat log.
- Runs `Analyst` -> `Judge`.
- Returns the updated Relationship stats to the client.

---

### Phase 3: Integration (The Loop)
**Goal:** Connect the components into a circular gameplay loop.

#### [MODIFY] `src/app/page.tsx` (or Main Chat Component)
- Add "End Scene" / "Sleep" button to trigger the Analyst.
- On success of Analyst:
    - Display "Scene Summary" modal (Stats changed).
    - Update local state with new Relationship values.
    - Clear chat history (or archive it) for the next scene.

#### [MODIFY] `src/app/api/chat/route.ts`
- Add stream scanning for `[EVENT: TRIGGER_ASSESSMENT]`.
- If detected, insert a special stop signal or header to inform the client to trigger an immediate force-analysis.

## Verification Plan

### Automated Tests
- **Director Tests:** Unit tests for `director.ts` ensuring specific stats trigger specific text blocks.
    - *Example:* "Low Trust (<20) MUST include 'Do not believe promises'."
- **Judge Tests:** Unit tests for `judge.ts` ensuring math is correct.
    - *Example:* "High Aggression input should lower Trust."

### Manual Verification
1.  **Guardrail Check:** Set Character Trust to 10. Chat with them. Verify they are skeptical/hostile.
2.  **Cycle Check:**
    -   Start Scene (Trust: 50).
    -   Be aggressive/insulting.
    -   End Scene.
    -   Verify Trust drops (e.g., to 40).
    -   Start Next Scene. Verify behavior is slightly colder (Director output changes).
