# Implementation Plan: Hybrid Relationship Engine v2.0

This plan outlines the steps to implement the architecture defined in `docs/High-Level Design_ Hybrid Relationship Engine v2.0.md` and the changes described in `change_requests/CR001_Engine_Driven_Chat/HLD.md`.

## User Review Required
> [!IMPORTANT]
> **Breaking Change:** The logic for generating system prompts creates a hard dependency on strict `OCEAN` and `PRQC` stats. Existing characters without these stats may default to "neutral" or broken behavior. Verification of data migration or default fallbacks is needed.

## Proposed Changes

### Phase 1: The Director (Basic Rules & Prompting)
**Goal:** Replace the current generic system prompt with a deterministic, rule-based "Guardrail" system, focusing on **Base Identity** and **Relationship State**.

#### [NEW] `src/lib/engine/rules.ts`
- Define `InstructionCatalogue` constant.
- **Scope:** Implement rules ONLY for **Section 1 (OCEAN)** and **Section 2 (PRQC)** from the Master Catalogue.
- Define Types for `OCEAN`, `PRQC`, and `Rule`.

#### [NEW] `src/lib/engine/director.ts`
- Implement `GenerateSystemPrompt(character, relationship)` function.
- Logic: Iterate through `InstructionCatalogue`, evaluate IF conditions against stats, append THEN instructions.

#### [MODIFY] `src/app/api/chat/route.ts`
- Replace `generateSystemPrompt` call with the new `Director.GenerateSystemPrompt`.
- Ensure character/relationship state passed from client conforms to the new Type requirements.

#### Phase 1 Verification
- **Automated Tests:** Create unit tests checking standard Personality triggers (e.g., High O, Low C) and Relationship State triggers (e.g., Low Trust).
- **Manual Guardrail Check:** Set Character Trust to 10. Chat with them. Verify they are skeptical/hostile in their response tone (based on Section 2 rules).

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

#### Phase 2 Verification
- **Automated Tests:** Create unit tests for `judge.ts` ensuring math is correct.
    - *Example:* "High Aggression input should lower Trust."
- **Integration Test:** Call `/api/engine/process-scene` with a mock chat log and verify it returns a valid JSON with calculated Relationship adjustments.

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

#### Phase 3 Verification
- **Cycle Check:**
    -   Start Scene (Trust: 50).
    -   Be aggressive/insulting.
    -   End Scene (Click Sleep button).
    -   Verify Trust dropsin the Summary Modal (e.g., to 40).
    -   Start Next Scene. Verify behavior is slightly colder (Director output changes).
    -   Verify data persistence (if DB is hooked up) or state persistence across the session.

---

### Phase 4: Advanced Rules (Intersections & Constraints)
**Goal:** Implement the complex, high-specificity rules from Sections 3, 4, and 5.

#### [MODIFY] `src/lib/engine/rules.ts`
- Expand `InstructionCatalogue` to include:
    - **Section 3:** Complex Intersections (e.g., "Anxious Attachment": High N + High Commitment).
    - **Section 4:** Ideal Partner Matching (Requires `User.Persona` input).
    - **Section 5:** System Hard Constraints (e.g., "Stranger Danger", "Loyalty").
- Add logic to handle rules requiring `User` data (Ideal Matching) or `System` overrides (Constraints).

#### [MODIFY] `src/lib/engine/director.ts`
- Update `GenerateSystemPrompt` to accept `UserPersona` and evaluate the new advanced rules.
- Ensure "Hard Constraints" (Section 5) take precedence or are appended with high priority (SYSTEM_MESSAGE reinforcement).

#### Phase 4 Verification
- **Intersection Test:** Create a character with High Neuroticism (80) and High Commitment (80). Verify "Anxious Attachment" instruction appears in the prompt.
- **Constraint Test:** Set Intimacy to 5 and Trust to 5. Verify "Stranger Danger" protocol prevents the character from agreeing to a defined "Go to second location" test prompt.
