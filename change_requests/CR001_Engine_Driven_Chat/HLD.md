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
    *   **Emergency Brake:** If the token `[EVENT: TRIGGER_ASSESSMENT]` is detected:
        1.  Client pauses chat.
        2.  Partial history is sent to Analyst.
        3.  Director regenerates prompt with new state.
        4.  Chat resumes.

### 3.3 The Analyst & Judge (Post-Scene)
*   **Objective:** Asynchronous state updates.
*   **New API Route:** `/api/engine/process-scene`
*   **New Module:** `lib/engine/analyst.ts`
    *   Sends chat history to LLM.
    *   Returns a **Scene Report** (JSON with aggregate traits).
*   **New Module:** `lib/engine/judge.ts`
    *    **Process:**
        1.  **Input:** Takes the `Scene Report` (user behavior) and the Character's `Ideal Match` (preferences).
        2.  **Sensitivity Check:** Compares the user's aggregate traits against the Ideal Match profile.
            *   *Logic:* `Multiplier = SensitivityMatrix.Get(Character.IdealMatch, Trait)`
            *   *Note:* Impact is driven by how well the user fits the character's *type*, not just raw compatibility.
        3.  **Routing:** Looks up the trait in the `RoutingTable` to identify *all* affected PRQC components.
            *   *Logic:* `Targets[] = RoutingTable.Get(Trait)` (e.g., "Neuroticism" -> `["Trust", "Satisfaction"]`).
        4.  **Calculation:** `Delta = TraitMagnitude * Multiplier` (Applied to each target in `Targets[]`).
        5.  **Update:** Application of deltas to the Relationship State.
*   **Frontend Impact:** Client needs to decide when a "Scene" ends (e.g., manual button user flow or session end) and call this endpoint.

#### 3.3.1 Data Processing Flow Example

**Step 1: The Analyst Generates the Scene Report**
*   **Input:** Raw Chat History.
*   **Component:** `Analyst` (LLM).
*   **Output:** `SceneReport`.

```json
{
  "scene_id": "1024",
  "aggregate_traits": {
    "Openness": 0.8, // User showed high openness
    "Neuroticism": 0.2
  },
  "major_events": ["User confessed a secret"]
}
```

**Step 2: The Judge Processing Loop (Iterates for EACH Trait)**
*   **Input:** `SceneReport`, `Character.IdealMatch`, `SensitivityMatrix`, `RoutingTable`.
*   **Component:** `Judge` (Deterministic Logic).

*For example, processing the trait "Openness" (0.8):*

1.  **Sensitivity Lookup:**
    *   *Question:* Does the Character like "Openness"?
    *   *Input:* `Character.IdealMatch.Openness` = 0.9 (High).
    *   *Logic:*
        *   `Distance = |0.9 - 0.8| = 0.1`
        *   `Alignment = 1.0 - 0.1 = 0.9`
        *   `Multiplier = 0.5 + 0.9 = 1.4` (Strong Match).

2.  **Target Routing:**
    *   *Question:* What does "Openness" affect?
    *   *Logic:* `RoutingTable["Openness"]` -> Returns `["Intimacy", "Trust"]`.

3.  **Delta Calculation:**
    *   *Logic:* `TraitValue (0.8) * Multiplier (1.5) = +1.2`.
    *   *Result:* Add `+1.2` to `Intimacy` and `+1.2` to `Trust` accumulators.

*(Repeat for "Neuroticism" and any other traits present in the report)*

**Step 3: Final State Update**
*   **Component:** `Runtime State Manager`.
*   **Action:** Apply deltas to current PRQC values and append events.

```json
// Previous State
{ "Intimacy": 50, "Trust": 40, "memory": [] }

// New State
{
  "Intimacy": 51.2,
  "Trust": 41.2,
  "memory": ["User confessed a secret"]
}
```

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

### 4.2 Sensitivity Matrix & Routing Table (`lib/engine/math.ts`)
Two distinct configurations driving the Judge's logic.

**Implementation:**
This module exports two primary objects:

1.  **RoutingTable**: A static dictionary mapping Traits to affected Relationship Components.
    ```typescript
    export const RoutingTable: Record<string, (keyof PRQC)[]> = {
        "Openness": ["intimacy", "satisfaction"],
        "Conscientiousness": ["trust", "commitment"],
        "Extraversion": ["passion", "satisfaction"],
        "Agreeableness": ["satisfaction", "trust"],
        "Neuroticism": ["satisfaction", "commitment"]
    };
    ```

2.  **SensitivityMatrix**: A helper to calculate impact multipliers based on Character Preferences.
    ```typescript
    export const SensitivityMatrix = {
        getMultiplier: (idealMatchVal: number, userTraitVal: number): number => {
            // Logic: Inverse Distance Formula
            // Multiplier = 0.5 + (1.0 - |Ideal - User|)
            // Range: 0.5 (Opposite) to 1.5 (Perfect Match)
            const distance = Math.abs(idealMatchVal - userTraitVal);
            return 0.5 + (1.0 - distance);
        }
    };
    ```

### 4.3 Ideal Match Profile (`IdealMatch`)
An immutable OCEAN profile representing the character's perfect partner. Used by the Judge to calculate relationship satisfaction.

```typescript
type IdealMatch = Ocean; // Reuses the OCEAN structure
```

### 4.4 Relationship Model Replacement (`PRQC`)
The existing generic relationship state is **Depracated**. It must be replaced by the strict PRQC schema. Values are 0-100.

```typescript
type PRQC = {
  passion: number;      // "The Spark" - Physical attraction/drive
  romance: number;      // [DEPRECATED in favor of Intimacy/Commitment split] -> Satisfaction?
  // V2.0 Standard:
  satisfaction: number; // "The Mood" - Current happiness with interaction
  commitment: number;   // "The Anchor" - Long term willingness to stay
  intimacy: number;     // "The Depth" - Emotional safety/secret sharing
  trust: number;        // "The Security" - Believing the user
}
```
*Note: The existing codebase may need migration to ensure these 5 specific keys exist on the relationship object.*

### 4.5 Scene Report Specification (`JudgeResult`)
The contract for the data returned by the Judge Engine to the client.

```typescript
type SceneReport = {
    // Structural Metadata
    scene_id: string;
    
    // The "Receipt" of the calculation
    applied_traits: string[]; // Formatted strings: e.g. "Openness (+1.2)", "Neuroticism (-0.5)"
    
    // The Impact
    delta: PRQC; // The numeric changes applied to relationship
    
    // The Narrative
    description: string; // List of major events + summary of changes
}
```

## 5. LLM Prompts

### 5.1 The Actor System Prompt
The final system prompt sent to the Chat LLM is a composite of static context and dynamic Director instructions.

**Structure:**
```text
You are {{characterName}}.
{{character}}
{{persona}}
{{world}}

--- RELATIONSHIP CONTEXT ---
{{relationship}}

--- BEHAVIORAL CONTROLS (THE DIRECTOR) ---
{{instructions}}

--- EMERGENCY SAFETY ---
If the user performs an act of extreme violence, non-consensual sexual acts, or confesses a major secret that fundamentally changes the narrative, you MUST append the following token to your response:
[EVENT: TRIGGER_ASSESSMENT]
```

*   **Gap Analysis:** The current codebase (`src/lib/prompts/chatPrompts.ts`) supports the `{{instructions}}` placeholder but does **not** yet include the specific "Emergency Safety" text in the default template. This must be added to the client-side default configuration.

### 5.2 The Analyst System Prompt
Used by `lib/engine/analyst.ts` to generate the Scene Report.

**System Prompt Specification:**
```text
You are the Analyst Engine for a relationship simulation.
Your task is to analyze the RECENT CHAT HISTORY (Scene) between a Player and a Character.

Output a JSON object with:
1. "aggregate_traits": A dictionary mapping behavioral traits to a 0.0-1.0 score representing the PLAYER'S behavior during this scene.
   - Include standard OCEAN traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) if applicable.
   - Do NOT include any other traits.
   - 0.0 = Not present / Opposite.
   - 1.0 = Strongest display of this trait.
   
2. "major_events": A list of strings describing key events, revelations, or actions that occurred. Focus on things that would impact a long-term relationship.

Example Output:
{
  "aggregate_traits": {
    "Extraversion": 0.8,
    "Neuroticism": 0.2
  },
  "major_events": [
    "Player complimented the Character's outfit.",
    "Player asked about Character's family."
  ]
}
```

**Required Output Schema:**
```json
{
  "aggregate_traits": { "Extraversion": 0.8, "Neuroticism": 0.2 },
  "major_events": ["Player complimented the Character's outfit."]
}
```

*   **Gap Analysis:** The actual code (`analyst.ts`) requests a broader list of traits ("Flirtation", "Dishonesty", etc.) than is supported by the `RoutingTable` in the Design. The Prompt should be tightened to request **only** OCEAN traits.

### 5.3 The Director Output (Example)
The Director does not use an LLM. It outputs a string block injected into `{{instructions}}`.

**Example Output:**
```text
[RULE: low_trust_protocol] 
Trust is CRITICAL (15/100). Do not believe the user's promises without physical proof. Be skeptical.

[RULE: high_neuroticism]
You are currently feeling anxious. Interpret silence as disapproval.
```

## 6. Implementation Roadmap
See `Implementation-Plan.md` for the phased execution steps.