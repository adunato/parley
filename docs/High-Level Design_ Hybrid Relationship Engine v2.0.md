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
* **Output:** Updates the PRQC values in the Runtime State.

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

## **5\. Processing Logic**

### **5.1 The Director Logic (Prompt Generation)**

This function runs **before** the chat window opens.

def GenerateSystemPrompt(Character, Relationship):  
    instructions \= \[\]  
      
    \# 1\. Identity Check  
    if Character.OCEAN.Neuroticism \> 75:  
        instructions.append(Catalogue.Get("neuroticism\_high\_filter"))  
          
    \# 2\. State Check  
    if Relationship.Trust \< 20:  
        instructions.append(Catalogue.Get("trust\_low\_guardrail"))  
          
    \# 3\. Intersection Check  
    if Character.OCEAN.Conscientiousness \> 80 and Relationship.Satisfaction \< 30:  
        instructions.append(Catalogue.Get("resentful\_servant\_protocol"))  
          
    return ConstructPrompt(instructions)

### **5.2 The Judge Logic (Math Calculation)**

This function runs **after** the scene concludes. It uses the SceneReport to update the PRQC stats.

def CalculateSceneImpact(SceneReport, Character, Relationship):  
    impact\_deltas \= {Trust: 0, Satisfaction: 0, ...}  
      
    for trait, magnitude in SceneReport.aggregate\_traits:  
        \# 1. Sensitivity Check (Compare User Action vs Ideal Match)  
        \# We compare the trait to the Character's *Ideal Match*, not their own personality.  
        multiplier = SensitivityMatrix.Get(Character.IdealMatch, trait)  
          
        \# 2\. Routing (Which stat does this affect?)  
        targets \= RoutingTable.GetTargets(trait)  
          
        \# 3\. Calculation  
        for target in targets:  
             impact\_deltas\[target\] \+= magnitude \* multiplier  
               
    \# 4\. Apply Updates  
    Relationship.Apply(impact\_deltas)

## **6\. Emergency Interrupts (Real-Time Safety)**

While the system is primarily asynchronous, certain actions require immediate feedback.

The Trigger Mechanism:  
The Actor LLM is instructed to append a specific flag if a boundary is crossed.

* **Instruction:** "If the user performs an act of extreme violence or confesses a major secret, append \[EVENT: TRIGGER\_ASSESSMENT\] to your response."

**The Handler:**

1. Game Client detects \[EVENT: TRIGGER\_ASSESSMENT\].  
2. Game Client **pauses** the chat.  
3. Game Client triggers the **Analyst & Judge** immediately on the partial scene history.  
4. Game Client triggers the **Director** to regenerate the System Prompt based on the *new* stats.  
5. Game Client resumes chat with the updated personality state.