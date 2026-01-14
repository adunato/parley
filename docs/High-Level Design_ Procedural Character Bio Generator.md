# **High-Level Design: Procedural Character Bio Generator**

## **1\. Executive Summary**

This document outlines the architecture for a **Phased Phased Procedural Character Generator**. Unlike standard generators that select attributes at random (often resulting in incoherent characters), this system uses a **Phased Constraint Satisfaction Engine**.

The system treats a character's life as a series of logical **Age Phases**. Within each phase, the system interleaves the selection of major life milestones ("The Spine") and the simulation of probabilistic events ("The Flesh"). This ensures that events occurring early in a character's life (e.g., during Childhood) can logically influence and unlock paths in later phases (e.g., Education or Career).

The system supports:
1. **Forward Generation:** Creating a coherent life path phase-by-phase based on weighted probabilities and accumulated state.
2. **Constraint Solving ("Pinning"):** Allowing a user to define a specific end-state (e.g., "Career: Surgeon") and automatically backfilling prerequisites via backward propagation before starting the phased generation.

## **2\. Core Concepts & Vocabulary**

### **2.1 Tags**

**Tags** are the atomic units of a character's state. They act as the "memory" of the system.
* *Examples:* WEALTHY, ORPHANED, DEGREE\_MEDICAL, CRIMINAL\_RECORD.  
* *Function:* Tags trigger future events or block them. A character with the CRIMINAL\_RECORD tag might be blocked from the POLICE\_OFFICER career.

### **2.2 Weights (The Luck System)**

**Weights** determine the probability of an event occurring based on the character's existing tags.
* *Scenario:* "Getting into Ivy League University."  
* *Modifier:* If character has WEALTHY tag: Weight x50 (Very likely).  
* *Modifier:* If character has POOR tag: Weight x0.5 (Extremely rare).

### **2.3 Age Phases**

The character's life is divided into chronological buckets called **Phases**.
1. **Childhood** (Age 0-18): Primary Spine node: `ORIGIN`.
2. **Formative** (Age 18-25): Primary Spine node: `EDUCATION`.
3. **Professional** (Age 25-65): Primary Spine node: `CAREER`.
4. **Senior** (Age 65+): Focuses on post-career events.

Each phase has configurable age boundaries, simulation intervals, and event trigger probabilities.

## **3\. System Architecture**

graph TD
    UI[Frontend Configuration UI] -->|Update Data| Store[Zustand Store + Dexie]
    Store -->|Inject Dataset & Config| Engine[BioMachine]
    
    subgraph "Interleaved Logic (Per Phase)"
        Engine -->|Step 1| Spine[Resolve Spine Node for Phase]
        Engine -->|Step 2| Flesh[Simulate Life Events for Phase]
        Spine -->|Accumulate Tags| Flesh
        Flesh -->|Accumulate Tags| NextPhase[Next Phase]
    end
    
    Engine -->|JSON Payload| LLM[Layer 3: The Skin (LLM)]
    LLM --> Output[Final Text Biography]

### **Layer 0: Frontend Configuration (UI & State)**
* **State Management:** `useBioStore` (Zustand) handles the dataset, global phase configuration, and persistence.
* **Phase-Aware Editors:** The configuration UI is organized by Age Phases. Spine nodes are assigned to exactly one phase, while Life Events can span multiple phases.
* **Global Settings:** Users can adjust age boundaries and simulation frequencies globally.

### **Layer 1: The Phased Engine (BioMachine)**
The engine executes a chronological loop through the defined Age Phases.
* **Process:**
    1. **Constraint Solving:** Before the loop, if an end-state is pinned, the engine prunes impossible nodes in earlier phases (Backward Propagation).
    2. **Spine Resolution:** In each phase, if a slot type is assigned (e.g., `ORIGIN` for `Childhood`), the engine picks one valid node.
    3. **Flesh Simulation:** The engine then runs multiple simulation iterations within the phase's age range.
    4. **Tag Accumulation:** Tags gathered from both Spine nodes and Life Events immediately influence selections later in the same phase and in all subsequent phases.

### **Layer 2: The Skin (Narrative)**
Converts the structured JSON into human-readable text using an LLM.

## **4\. Data Logic & Schema**

### **4.1 Schema Definition**

#### **EventNode (Spine)**
```typescript
interface EventNode {
  id: string;
  slot: 'ORIGIN' | 'EDUCATION' | 'CAREER';
  phase: AgePhase;        // Single assigned phase
  text: string;
  requires?: string[];
  provides?: string[];
  weights: { [tag: string]: number; "DEFAULT": number };
}
```

#### **LifeEvent (Flesh)**
```typescript
interface LifeEvent {
  id: string;
  phases: AgePhase[];     // Can belong to multiple phases
  text: string;
  provides?: string[];
  weights: { [tag: string]: number; "DEFAULT": number };
}
```

## **5\. Algorithm Detail: Phased Generation**

1. **Initialization:** Load data and configuration from the store.
2. **Backward Propagation:** If a Career is pinned, filter the Education pool to only include nodes that satisfy the Career's requirements.
3. **Phased Loop:** For each phase (Childhood → Formative → Professional → Senior):
    * **Spine Selection:** Filter nodes of the corresponding slot type by the current phase and requirements. Pick one using weighted random selection.
    * **Simulation:** Iterate from `Phase.startAge` to `min(Phase.endAge, targetAge)` using `Phase.simulationInterval`.
    * **Event Selection:** In each iteration, roll for trigger chance. If successful, pick a Life Event from the pool associated with the current phase that meets requirements and hasn't occurred yet.
4. **Final Result:** Compile the spine nodes and life events into a chronological `BioState`.

## **6\. Development Status**

### **Implemented**
* **Interleaved Phased Engine:** `BioMachine.generate()` executes the chronological phase loop.
* **Dynamic Configuration:** Global phase settings (ages, intervals) are stored and used by the engine.
* **Phase-Aware UI:** Configuration tabs and editors updated to support phase assignment.
* **Data Migration:** Store automatically migrates legacy data to the phased schema.

## **7\. Appendix: Sample Data Sets**

The following are JSON examples of the datasets required to power Layer 1 (The Spine) and Layer 2 (The Flesh).

### **7.1 origins.json (Layer 1\)**

Defines the starting state of the simulation.

\[
  {
    "id": "working\_class\_urban",
    "slot": "ORIGIN",
    "text": "Born into a cramped apartment in an industrial district.",
    "provides": \["POOR", "STREET\_SMART"\],
    "weights": { "DEFAULT": 50 }
  },
  {
    "id": "old\_money",
    "slot": "ORIGIN",
    "text": "Born into a family with generational wealth and high expectations.",
    "provides": \["RICH", "CONNECTED", "SNOB"\],
    "weights": { "DEFAULT": 5 }
  }
\]

### **7.2 education.json (Layer 1\)**

Logic connector between Origin and Career.

\[
  {
    "id": "ivy\_league",
    "slot": "EDUCATION",
    "text": "Accepted into a prestigious Ivy League university.",
    "provides": \["DEGREE\_ADVANCED", "ALUMNI\_NETWORK", "DEBT"\],
    "requires": \["GOOD\_GRADES"\],
    "weights": {
      "RICH": 50,
      "STRESSED": 20,
      "POOR": 1,
      "DEFAULT": 5
    }
  },
  {
    "id": "trade\_school",
    "slot": "EDUCATION",
    "text": "Opted for a trade school to start earning money quickly.",
    "provides": \["TRADESMAN\_CERT", "NO\_DEBT"\],
    "weights": {
      "STREET\_SMART": 30,
      "POOR": 20,
      "RICH": 1,
      "DEFAULT": 10
    }
  }
\]

### **7.3 career.json (Layer 1\)**

The final node of the spine. Note the strict requires field.

\[
  {
    "id": "investment\_banker",
    "slot": "CAREER",
    "text": "Secured a high-pressure job at an investment bank.",
    "provides": \["WEALTHY", "BURNOUT", "HIGH\_STATUS"\],
    "requires": \["DEGREE\_ADVANCED"\],
    "weights": {
      "ALUMNI\_NETWORK": 100,
      "DEFAULT": 10
    }
  },
  {
    "id": "electrician",
    "slot": "CAREER",
    "text": "Started a contracting business fixing residential wiring.",
    "provides": \["STABLE\_INCOME", "PHYSICAL\_TOLL"\],
    "requires": \["TRADESMAN\_CERT"\],
    "weights": {
      "DEFAULT": 50
    }
  }
\]

### **7.4 events.json (Layer 2)**

These events are simulated in the "Flesh" layer. They do not block the career path but add narrative color.

\[
  {
    "id": "severe\_accident",
    "text": "Suffered a debilitating injury at work.",
    "provides": \["CHRONIC\_PAIN", "MEDICAL\_DEBT"\],
    "weights": {
      "PHYSICAL\_TOLL": 20,
      "DANGEROUS\_JOB": 50,
      "DEFAULT": 1
    }
  },
  {
    "id": "white\_collar\_crime",
    "text": "Investigated for insider trading.",
    "provides": \["CRIMINAL\_RECORD\_FINANCIAL"\],
    "weights": {
      "WEALTHY": 10,
      "BURNOUT": 15,
      "POOR": 0,
      "DEFAULT": 0
    }
  }
\]

## **8\. User Guide & Mechanics**

This section explains the underlying logic of the Bio Generator, specifically how probabilities are calculated and how user constraints (Pinning) affect the outcome.

### **8.1 The Mechanics of Choice**

Selection in the Bio Generator uses a **Weighted Random Selection** process. It is not a simple percentage (like "5% chance"); instead, it is a competition between all valid options in a pool.

#### **8.1.1 Selection Pools & Mutuality**
*   **The Spine (Origin, Education, Career):** Options within these slots are **mutually exclusive**. You can only have one Origin, one Education path, and one Career. The engine evaluates all potential options for a slot, filters out those whose requirements aren't met, and then picks exactly one from the remaining "Feasible Pool."
*   **The Flesh (Life Events):** These are individual events. While multiple events can happen over a lifetime, each specific event (by ID) can only occur **once**.

#### **8.1.2 From Weights to Probability**
The "actual chance" of an event is its share of the total weight in the current pool.

**Probability = (Event Weight) / (Sum of All Weights in the Feasible Pool)**

*   **Competing Events Example:**
    *   Imagine a selection pool with two events: **Ivy League** (Default Weight: 5) and **Trade School** (Default Weight: 20).
    *   **Total Weight:** 5 + 20 = 25.
    *   **Ivy League Chance:** 5/25 = **20%**.
    *   **Trade School Chance:** 20/25 = **80%**.
    *   *If the character gains the `RICH` tag (x10 modifier for Ivy League):*
    *   **New Ivy League Weight:** 5 × 10 = 50.
    *   **New Total Weight:** 50 + 20 = 70.
    *   **New Ivy League Chance:** 50/70 = **71.4%**.
*   **Default Weight:** This is the baseline "gravity" of an option before any modifiers are applied. It represents how common an event is in a vacuum.

---

### **8.2 The Role of Age & Generation Sequence**

The engine follows a strict "Spine-then-Flesh" sequence. The **Spine** (Origin, Education, Career) is always generated first and represents the character's status as they enter adulthood (age 18). The **Flesh** (Life Events) is a chronological simulation that builds upon that foundation.

#### **8.2.1 Generation Walkthrough: 18-Year-Old**
For a character whose target age is 18, the simulation effectively stops after the Spine is built.

1.  **Step 1: Origin Selection.** The engine picks an Origin (e.g., `Born into Wealth`). The character gains the `RICH` tag.
2.  **Step 2: Education Selection.** The engine filters Education options. Paths like `Street Education` might be excluded or heavily penalized, while `Private Tutor` becomes highly likely due to the `RICH` tag. The engine picks `Private Tutor`. The character gains the `SMART` tag.
3.  **Step 3: Career Selection.** The engine filters Careers. `Investment Banker` requires `SMART`. Since the character has it, this becomes a valid option. The engine picks `Investment Banker`.
4.  **Simulation Check:** Since the character is 18, the engine checks the "Flesh" layer. Iteration starts at 18 and ends at 18. **No Life Events are generated.**
5.  **Final Result:** A high-status 18-year-old ready to start their career.

#### **8.2.2 Generation Walkthrough: 65-Year-Old**
For an older character, the engine first establishes the foundation (Spine) and then simulates the intervening decades.

1.  **Step 1-3 (The Spine):** The engine performs the same steps as above. Let's assume the character ends up as an `Electrician` with the `TRADESMAN` and `STREET_SMART` tags at age 18.
2.  **Step 4: Simulation (The Flesh):** The engine runs multiple 5-year iterations:
    *   **Age 18-23:** 70% chance check passes. Weighted selection finds `Work Accident`. (Weight was increased by `TRADESMAN` tag). Character gains `INJURED` tag.
    *   **Age 23-28:** 70% chance check fails. No event.
    *   **Age 28-33:** 70% chance check passes. Weighted selection finds `Career Change`. (Weight was increased by `STREET_SMART` tag). Character gains `NEW_OUTLOOK`.
    *   **... (Iterations continue until age 65) ...**
3.  **Step 5: Final Accumulation.** All tags gathered during the simulation (e.g., `INJURED`, `NEW_OUTLOOK`, `GRANDPARENT`) are combined with the original Spine tags.
4.  **Final Result:** A 65-year-old with a logical career beginning and a lifetime of probabilistic events that were shaped by that beginning.

---

### **8.3 Summary of Logic Flow**

| Feature | Spine (Layer 1) | Flesh (Layer 2) |
| :--- | :--- | :--- |
| **Timing** | Pre-18 (Foundation) | Post-18 (Simulation) |
| **Mutuality** | Mutually Exclusive (1 per slot) | Cumulative (Many possible) |
| **Dependence** | Forward & Backward Constraints | Forward Influence only |
| **Selection** | Mandatory (Pool must result in 1) | Probabilistic (70% trigger chance) |

---

### **8.3 Pinning & Reverse Generation**

Pinning allows you to "force" a specific outcome (e.g., "Must be a Surgeon"). The engine then uses **Backward Propagation** to ensure the character's history supports that outcome.

1.  **Domain Reduction:** If you pin a Career, the engine deletes all other options from the Career slot.
2.  **Requirement Harvesting:** It looks at the `requires` list of the pinned Career (e.g., `requires: [DEGREE_MEDICAL]`).
3.  **Pruning Precursors:** It then looks at the **Education** slot and removes any path that does *not* provide `DEGREE_MEDICAL`.
4.  **Forward Selection:** Now that the "impossible" paths are gone, it generates the character forward normally, knowing that whatever it picks for Education will definitely satisfy the Career's needs.

---

### **8.4 Configuration & UI**
... (rest of the section)

Creators can modify these probabilities and logical connections using the built-in configuration tools.

#### **The Bio Config Page**
Located in the application settings, this page allows for CRUD (Create, Read, Update, Delete) operations on the entire dataset.
*   **Dataset Editors:** Specialized forms for editing Origins, Education, Careers, and Life Events. You can define the text, the tags provided/required, and the weight modifiers.
*   **Tag Manager:** Define the vocabulary of the system. Renaming a tag here will automatically update all references to it across the entire dataset (Cascading Rename).

#### **The Bio Graph View**
This tool provides a visual map of the "Spine".
*   **Nodes:** Represent Origins, Education, or Careers.
*   **Edges:** Represent logical requirements. If Career A requires Tag B, and Education C provides Tag B, an arrow will show the dependency.
*   **Utility:** Use this to identify "Logical Dead Ends" (e.g., a Career that requires a tag that no Education node provides).