# **High-Level Design: Hybrid Relationship Engine**

Version: 2.0  
Scope: RPG Character Interaction System  
Architecture: Asynchronous Scene Cycle (Director / Actor / Analyst)

## **1\. Executive Summary**

This document outlines the architecture for a procedural relationship engine that balances **narrative nuance** with **mechanical consistency**.

Unlike V1.0 (which attempted real-time mathematical assessment of every message), V2.0 utilizes an **Asynchronous Scene Cycle**.

* **The Director (Pre-Scene):** Deterministic code generates strict behavioral "Guardrails" for the LLM based on the current relationship state *before* the conversation begins.  
* **The Actor (Real-Time):** The LLM engages freely within those guardrails, prioritizing immersion and flow without performing calculations.  
* **The Analyst (Post-Scene):** A background process reviews the interaction to calculate statistical updates, which are applied to the state for the *next* scene.

This ensures characters have consistent personalities and "long memories" without disrupting the flow of conversation with heavy processing.

## **2\. Core Concepts**

The system relies on converting narrative context into strict instructions, and then converting narrative history into mathematical values.

### **2.1 The Instruction Catalogue (The "Script")**

The engine does not rely on the LLM to "feel" emotions. It relies on a database of conditional rules.

* **Definition:** A deterministic list of IF/THEN conditions that output explicit System Instructions.  
* **Example:** IF \[Trust \< 20\] THEN \[INSTRUCTION: "Do not believe promises."\]

### **2.2 OCEAN & PRQC (The DNA)**

* **OCEAN (Personality):** The immutable "Identity" of the character (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism).  
* **Ideal Match (Preference):** An immutable secondary OCEAN profile representing the character's "Perfect Partner".  
* **PRQC (Relationship State):** The mutable "Health" of the connection (Satisfaction, Commitment, Intimacy, Trust, Passion).

### **2.3 The Scene Report (The Aggregate Input)**

Instead of judging every single sentence, the engine judges the **Aggregate Behavior** of the user during a specific scene.

* **Role:** Acts as the payload for the math engine. It answers: "In this scene, was the User generally Supportive? Aggressive? Reliable?"

## **3\. Architecture Overview: The Circular Loop**

The data flow is circular, occurring in three distinct phases per gameplay interaction.

### **Phase 1: The Director (Pre-Scene)**

* **Input:** Current Character State (OCEAN \+ PRQC).  
* **Process:** Queries the **Instruction Catalogue**.  
* **Output:** A constructed **System Prompt** containing specific behavioral rules (e.g., "Be paranoid," "Be flirtatious").

### **Phase 2: The Actor (Real-Time)**

* **Input:** System Prompt \+ User Chat Messages.  
* **Process:** Standard LLM chat generation.  
* **Constraint:** Must adhere to the "Guardrails" set by the Director.  
* **Emergency Brake:** If a critical threshold is crossed (e.g., Violence), the Actor triggers an immediate "Event Interrupt" to force an early assessment.

### **Phase 3: The Analyst & Judge (Post-Scene)**

* **Input:** Full Chat History of the scene.  
* **Process (Analyst):** LLM summarization to generate a **Scene Report** (Traits displayed).  
* **Process (Judge):** Deterministic code calculates the mathematical impact of those traits using the **Sensitivity Matrix**.  
*   **Output:** Updates the PRQC values in the Runtime State.

### **Phase 4: Emergency Interrupt (Conditional)**

*   **Trigger:** Triggered **during** Phase 2 if the Actor detects a critical boundary violation.
*   **Process:** Immediately pauses Phase 2 and invokes Phase 3 (Analyst/Judge) on the partial scene.
*   **Result:** Forces a premature cycle completion and restarts Phase 1 (Director) with new constraints.

## **4. Data Flows**

### **4.1 The Director (Pre-Scene)**

**Event Sequence**
| Step | Component | Input | Action | Output |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Game Client | Character State (OCEAN + PRQC) | Requests a tailored System Prompt for the upcoming scene. | `DirectorRequest` |
| 2 | Director Engine | `DirectorRequest` + `Instruction Catalogue` | Evaluates state against conditional rules (e.g., "If Trust < 20..."). | Matches List |
| 3 | Director Engine | Matches List | Compiles the active instructions into a coherent system prompt. | `SystemPrompt` (String) |

**Data Models**

**The Instruction Catalogue (Rule Definition)**
The database of conditional logic that drives the Director.

```json
{
  "rules": [
    {
      "id": "trust_low_guardrail",
      "condition": "Relationship.Trust < 20",
      "instruction": "HARD CONSTRAINT: You are suspicious. Do not believe unverifiable statements. Demand proof."
    },
    {
      "id": "neuroticism_high_filter",
      "condition": "Character.OCEAN.Neuroticism > 75",
      "instruction": "Interpret ambiguity as a threat. If the user is vague, assume the worst."
    },
    {
      "id": "ideal_match_bonus",
      "condition": "User.LastSceneTrait == Character.IdealMatch.PrimaryTrait",
      "instruction": "The user recently impressed you. Be slightly more receptive than your stats would normally allow."
    }
  ]
}
```

### **4.2 The Actor (Real-Time)**

**Event Sequence**
| Step | Component | Input | Action | Output |
| :--- | :--- | :--- | :--- | :--- |
| 1 | User | Text Input | Sends a chat message. | `UserMessage` |
| 2 | Actor (LLM) | `SystemPrompt` + `ChatHistory` | Generates a response while adhering to the Director's guardrails. | `AIMessage` (Stream) |
| 3 | Stream Monitor | `AIMessage` Stream | Scans for emergency flags (e.g., violence, broken rules). | `EventTrigger` (Optional) |

**Data Models**

**The Event Trigger (Emergency Brake)**
A token appended to the stream if a critical boundary is crossed.

```text
[EVENT: TRIGGER_ASSESSMENT]
```

### **4.3 The Analyst & Judge (Post-Scene)**

**Event Sequence**
| Step | Component | Input | Action | Output |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Game Client | `ChatHistory` | Detects scene end and submits history for processing. | `AnalysisRequest` |
| 2 | Analyst (LLM) | `ChatHistory` | Summarizes the interaction and scores the user's aggregate behavior key traits. | `SceneReport` |
| 3 | Judge (Engine) | `SceneReport` + `IdealMatch` + `Matrices` | 1. Compares User Traits vs. Character's Ideal Match (Sensitivity).<br>2. Maps Traits to Relationship Stats (Routing).<br>3. Calculates numeric impact. | `ImpactDeltas` |
| 4 | State Manager | `ImpactDeltas` + `CurrentState` | Applies the deltas to the persistent relationship values (PRQC). | `NewRuntimeState` |

**Data Models**

**The Scene Report (Analyst Output)**
The psychological summary of the user's behavior during the scene.

```json
{
  "scene_id": "1024",
  "summary": "The user tried to convince the character to steal the artifact. The character refused due to low trust.",
  "aggregate_traits": {
    "Openness": 0.8,
    "Conscientiousness": 0.6,
    "Aggression": 0.2
  },
  "major_events": ["User proposed theft", "User lied about security"]
}
```

**The Runtime State (PRQC)**
The persistent "Soul" of the relationship.

```json
{
  "target_id": "Player_One",
  "relationship_metrics": {
    "Satisfaction": 45,  // Current happiness with interaction
    "Commitment": 80,    // Long term willingness to stay
    "Intimacy": 30,      // Emotional depth/secret sharing
    "Trust": 15,         // Reliability/Belief in user
    "Passion": 10        // Physical/Emotional drive
  },
  "memory_tags": ["Lied about artifact", "Saved my life"]
}
```

### **4.4 Emergency Interrupt (Real-Time Safety)**

**Event Sequence**
| Step | Component | Input | Action | Output |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Actor (LLM) | User Input | Generates response and detects boundary violation (e.g., violence). | `AIMessage` + `[EVENT: TRIGGER_ASSESSMENT]` |
| 2 | Stream Monitor | `AIMessage` | Detects the trigger token. | `InterruptSignal` |
| 3 | Game Client | `InterruptSignal` | Pauses UI, stops generation. | `PartialChatHistory` |
| 4 | Analyst & Judge | `PartialChatHistory` | Runs immediate assessment (See 4.3). | `UpdatedRuntimeState` |
| 5 | Director | `UpdatedRuntimeState` | Generates new System Prompt. | `NewSystemPrompt` |

**Data Models**

**The Event Trigger Token**
A specific string appended to the stream to signal the client.

```text
[EVENT: TRIGGER_ASSESSMENT]
```

## **5. Processing Logic**

### **5.1 The Director Logic (Rule Engine)**

The Director operates on a "filtering" basis, not a generative one. It selects pre-written instructions based on state conditions.

**Algorithm: Rule Selection**
1.  **Fetch Rules:** Load all definitions from `Instruction Catalogue`.
2.  **Evaluate:** For each rule, evaluate `condition(Character, Relationship)`.
    *   *Logic:* `IF (Rule.Condition == TRUE) THEN Keep Rule`
3.  **Prioritize:** (Optional) Sort by priority flag if defined.
4.  **Construct:** Concatenate `Rule.Instruction` text blocks into the final system prompt.

**Pseudo-Code Representation**
```python
def GenerateSystemPrompt(Character, Relationship):
    active_instructions = []
    
    for rule in InstructionCatalogue:
        # Evaluation Logic
        if rule.evaluate_condition(Character, Relationship):
            active_instructions.append(rule.text)
            
    # Assembly Logic
    return " ".join(active_instructions)
```

### **5.2 The Actor Logic (Stream Monitoring)**

The Actor is primarily the LLM generation process, but the application layer must enforce safety via stream monitoring.

**Algorithm: Trigger Detection**
1.  **Buffer Stream:** Maintain a rolling buffer of the last N tokens/characters.
2.  **Scan:** Check if buffer contains `[EVENT: TRIGGER_ASSESSMENT]`.
3.  **Interrupt:** If found, close socket, discard remaining generation, and flag `SceneEnd`.

### **5.3 The Judge Logic (Mathematical Impact)**

This is the core deterministic engine that converts "Narrative" (Traits) into "Numbers" (PRQC).

**Formula 1: Sensitivity Calculation (The Multiplier)**
How much does the Character *care* about this specific behavior? We compare the User's actions against the Character's **Ideal Match**.

*   **Inputs:**
    *   `UserTraitValue` (0.0 to 1.0) - From Scene Report.
    *   `IdealMatchValue` (0.0 to 1.0) - From Character Profile.
*   **Logic:**
    *   High alignment (User is what Character wants) -> **> 1.0 Multiplier (Bonus)**
    *   Low alignment (User is opposite of what Character wants) -> **< 1.0 Multiplier (Penalty/Dampening)**
    *   Neutral -> **1.0 Multiplier**

*   **Calculation Logic (Inverse Distance):**
    We calculate how close the User's behavior was to the Ideal.
    1.  `Distance = |IdealMatchValue - UserTraitValue|` (Range 0.0 to 1.0)
    2.  `Alignment = 1.0 - Distance` (Range 1.0 to 0.0)
    3.  `Multiplier = 0.5 + Alignment` (Range 0.5 to 1.5)

    *Example:*
    *   Ideal: 0.9 (Loves Extroverts)
    *   User: 0.8 (Highly Extroverted) -> Distance 0.1 -> Multiplier **1.4** (Strong Bonus)
    *   User: 0.1 (Introverted) -> Distance 0.8 -> Multiplier **0.7** (Dampened)

**Formula 2: Routing (The Targets)**
A single trait can affect multiple relationship dimensions.

*   **Logic:**
    `TargetMetrics[] = RoutingTable[TraitName]`
    *   *Example:* "Aggression" -> `["Trust", "Satisfaction"]`

**Formula 3: Impact Application (The Delta)**
Calculate the change for each targeted metric.

*   **Calculation (Per Target):**
    `Delta = UserTraitValue * Multiplier`
*   **Update:**
    `NewMetricValue = Clamp(OldMetricValue + Delta, 0, 100)`

**Complete Execution Flow (Pseudo-Code)**
```python
def CalculateSceneImpact(SceneReport, Character, Relationship):
    
    for TraitName, TraitValue in SceneReport.AggregateTraits:
        
        # 1. Determine Sensitivity (The "Why")
        # We check against the IDEAL MATCH, not the character's own personality.
        IdealVal = Character.IdealMatch[TraitName] 
        Multiplier = SensitivityMatrix.Get(IdealVal, TraitValue)
        
        # 2. Determine Targets (The "Where")
        Targets = RoutingTable[TraitName]
        
        # 3. Apply Impact (The "How Much")
        for MetricKey in Targets:
             Delta = TraitValue * Multiplier
             
             # Apply to current state
             Relationship[MetricKey] = Loop.Clamp(Relationship[MetricKey] + Delta, 0, 100)
             
    return Relationship
```

### **5.4 Emergency Interrupt Logic (Real-Time Safety)**

While the system is primarily asynchronous, certain actions require immediate feedback.

**Algorithm: The Handler Loop**
1.  **Trigger:** Actor (LLM) appends `[EVENT: TRIGGER_ASSESSMENT]` (as defined in 4.2).
2.  **Pause:** Client detects token and pauses user input.
3.  **Analyze (Partial):** Client sends partial history to **Analyst & Judge** (See 5.3).
4.  **Re-Direct:** Client triggers **Director** (See 5.1) with new state to generate a fresh Prompt.
5.  **Resume:** Client resumes session with new personality/guardrails.
