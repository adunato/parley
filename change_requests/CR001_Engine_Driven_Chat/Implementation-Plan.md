# Implementation Plan: Hybrid Relationship Engine v2.0

This plan outlines the steps to implement the architecture defined in `docs/High-Level Design_ Hybrid Relationship Engine v2.0.md` and the changes described in `change_requests/CR001_Engine_Driven_Chat/HLD.md`.

## User Review Required
> [!IMPORTANT]
> **Breaking Change:** The logic for generating system prompts creates a hard dependency on strict `OCEAN` and `PRQC` stats. Existing characters without these stats may default to "neutral" or broken behavior. Verification of data migration or default fallbacks is needed.

## Proposed Changes

### Phase 1: Rules Catalogue Implementation
**Goal:** Define the core `InstructionCatalogue` containing all behavioral rules.

#### [NEW] `src/lib/engine/rules.ts`
- Define Types for `OCEAN`, `PRQC`, and `Rule`.
- Implement `InstructionCatalogue` constant.
- **Scope:** Implement rules for **Section 1 (OCEAN)** and **Section 2 (PRQC)** from the Master Catalogue.

#### Phase 1 Verification
- **Automated Tests:** Create unit tests that import `InstructionCatalogue`.
- **Test Case:** Select a specific rule (e.g., "High Openness") and assert that its Condition Logic returns `true` for matching stats (O=80) and `false` for non-matching stats (O=20).
- **Test Case:** Verify the Instruction text matches the `MASTER CATALOGUE OF LLM ACTING RULES.md`.

---

### Phase 2: Ideal Match Data Model
**Goal:** Implement the "Ideal Match" preference profile in the backend, UI, and Generator.

#### [MODIFY] `src/lib/types.ts`
- Add `idealMatch` property (Type: OCEAN) to the `Character` interface.

#### [MODIFY] `src/components/character-configuration.tsx` (UI)
- Update `handleAddCharacter` to initialize `idealMatch` with default values.
- Add UI section (Card/Sliders) to configure "Ideal Match" alongside the existing Personality configuration.

#### [MODIFY] `src/app/api/generate/character/route.ts` (Generation)
- Update the manual character object construction to include `idealMatch` from the parsed LLM result.
- *Note:* The Schema Generator (`src/lib/schemaGenerator.ts`) automatically reflects changes in `types.ts`, so the Prompt will update automatically.

#### Phase 2 Verification
- **Manual Check:** open Character Editor. Adjust "Ideal Match" sliders. Save. Reload page. Verify values persist.
- **Generation Test:** Generate a new character via LLM (using the "Sparkle" button). Inspect the internal state to ensure `idealMatch` is populated with non-zero/meaningful values.

---

### Phase 3: Relationship Data Model (PRQC)
**Goal:** Replace the current generic relationship model with the strict PRQC schema across the entire stack (Database, UI, Generator).

#### [MODIFY] `src/lib/types.ts`
- Update `Relationship` interface to enforce the PRQC structure:
    - `satisfaction` (0-100)
    - `commitment` (0-100)
    - `intimacy` (0-100)
    - `trust` (0-100)
    - `passion` (0-100)
    - *Remove deprecated fields:* `closeness`, `sexual_attraction`, `respect`, `engagement`, `stability`.

#### [MODIFY] `src/components/relationship-display.tsx` (UI)
- Update `RelationshipBar` components to map to the new PRQC fields.
- Update labels and tooltips to match new definitions (e.g., "Satisfaction" instead of "Closeness").

#### [MODIFY] `src/lib/prompts/generatorPrompts.ts`
- Update `RELATIONSHIP_JSON_STRUCTURE` to match the PRQC schema.
- Update `generateRelationshipPrompt` and `generateRelationshipDeltaPrompt` to instruct the LLM to output PRQC values.

#### [MODIFY] `src/app/api/generate/relationship/route.ts` & `src/app/api/generate/relationship-delta/route.ts`
- Verify these endpoints correctly handle the new schema (they likely rely on the shared `generatorPrompts`, but manual verification of the `parsedResult` mapping is needed).

#### [MODIFY] `src/lib/store.ts` (or State Manager)
- Ensure default new relationships are initialized with neutral PRQC values (e.g., 50/50/50/50/50 or as appropriate).

#### Phase 3 Verification
- **Manual Check:** Start a new chat or create a new relationship in the UI. Inspect the Relationship Display card. Verify it shows the 5 PRQC bars.
- **Generation Test:** Trigger "Generate Relationship" (if available via UI or API test). Verify the returned JSON contains `satisfaction`, `commitment`, etc.

---

### Phase 4: System Prompt Generation
**Goal:** Integrate the deterministic Director logic into the existing system prompt generator.

#### [NEW] `src/lib/engine/director.ts`
- Implement `GenerateSystemPrompt(character, relationship)` function.
- Logic: Iterate through `InstructionCatalogue`, evaluate IF conditions against the `character.ocean` and `relationship.prqc`, return a string of "Acting Instructions".

#### [MODIFY] `src/lib/prompts/chatPrompts.ts`
- Update `generateSystemPrompt` to accept an `actingInstructions` (string) argument.
- Append these instructions to the final prompt string (e.g., under a new header `--- ACTING INSTRUCTIONS ---`).

#### [MODIFY] `src/app/api/chat/route.ts`
- Call `Director.GenerateSystemPrompt` to get the rule-based instructions.
- Pass these instructions into the existing `generateSystemPrompt` call.

#### Phase 4 Verification
- **Manual Guardrail Check:** Set Character Trust to 10. Chat with them. Verify the instructions appear in the debug log and that the character output is skeptical/hostile (based on Section 2 rules).
- **Integration Test:** Verify that the "Ideal Match" data is available to the Director (even if not used for *Rules* yet, it should be passed through for future phases).

---

### Phase 5: Character Chat
**Goal:** Align the chat flow to the new design by eliminating per-message relationship assessments.

#### [MODIFY] `src/app/chat/page.tsx`
- Remove the `onMessageFinish` callback prop passed to `ChatComponent`.
- Delete the logic that calls `/api/generate/relationship-delta` after every message.
- Ensure the chat purely sends messages and receives responses without triggering side effects.

#### [MODIFY] `src/components/chat-component.tsx`
- Remove the `onMessageFinish` prop from the interface and the component logic.

#### Phase 5 Verification
- **Manual Check:** Chat with a character. Open the Network tab. Verify that NO calls to `relationship-delta` are made after the bot responds.
- **UI Check:** Verify the Relationship Display does not update or flash "deltas" during the active conversation.

---

### Phase 6: The Analyst & Judge (Math Engine)
**Goal:** Implement the post-scene feedback loop that updates relationship stats and visualizes the results.

#### [NEW] `src/lib/engine/analyst.ts`
- Implement `AnalyzeScene(chatLog)`: Calls LLM to summarize "User Traits" exhibited (Aggression, Kindness, etc.) into a `SceneReport`.

#### [NEW] `src/lib/engine/judge.ts`
- Implement `CalculateImpact(sceneReport, character, relationship)`:
    - Uses `SensitivityMatrix` to map "User Traits" to "PRQC Deltas".
    - Adjusts impact based on `Character.IdealMatch` (e.g. if User matches Ideal, bonus to Passion/Satisfaction).

#### [NEW] `src/components/scene-report-display.tsx`
- Create a UI component to visualize the "Scene Report":
    - **Detected Traits:** Lists what the Analyst found (e.g., "High Aggression").
    - **Impact:** Shows the calculated deltas (e.g., "Trust -15").
    - **Result:** Shows the new PRQC values.

#### [NEW] `src/app/api/engine/process-scene/route.ts`
- Receives chat log.
- Runs `Analyst` -> `Judge`.
- Returns the full `SceneReport` and updated Relationship stats to the client.

#### Phase 6 Verification
- **Automated Tests:** Create unit tests for `judge.ts` ensuring math is correct.
    - *Example:* "High Aggression input should lower Trust."
- **Integration Test:** Call `/api/engine/process-scene` with a mock chat log and verify it returns a valid JSON with calculated Relationship adjustments.
- **Visual Check:** Mock a `SceneReport` and render the `SceneReportDisplay` component to ensure it looks correct.

---

### Phase 7: Integration (The Loop)
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

#### Phase 7 Verification
- **Cycle Check:**
    -   Start Scene (Trust: 50).
    -   Be aggressive/insulting.
    -   End Scene (Click Sleep button).
    -   Verify Trust drops in the Summary Modal (e.g., to 40).
    -   Start Next Scene. Verify behavior is slightly colder (Director output changes).
    -   Verify data persistence (if DB is hooked up) or state persistence across the session.

---

### Phase 8: Advanced Rules (Intersections & Constraints)
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

#### Phase 8 Verification
- **Intersection Test:** Create a character with High Neuroticism (80) and High Commitment (80). Verify "Anxious Attachment" instruction appears in the prompt.
- **Constraint Test:** Set Intimacy to 5 and Trust to 5. Verify "Stranger Danger" protocol prevents the character from agreeing to a defined "Go to second location" test prompt.
