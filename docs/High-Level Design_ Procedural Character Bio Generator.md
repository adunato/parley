# **High-Level Design: Procedural Character Bio Generator**

## **1\. Executive Summary**

This document outlines the architecture for a **Bi-Directional Procedural Character Generator**. Unlike standard generators that select attributes at random (often resulting in incoherent characters, e.g., an uneducated teenager working as a Neurosurgeon), this system uses a **Constraint Satisfaction Engine**.

The system treats a character's life as a logical timeline. It supports two modes of operation:

1. **Forward Generation:** Creating a coherent life path from birth to present based on weighted probabilities (Social Class → Education → Career).  
2. **Constraint Solving ("Pinning"):** Allowing a user to define a specific end-state (e.g., "A 45-year-old Astronaut") and automatically backfilling the necessary prerequisites (must have a degree, must be physically fit, must have air force or engineering experience) while pruning impossible history events.

## **2\. Core Concepts & Vocabulary**

To maintain coherence, the system relies on three fundamental logic units.

### **2.1 Tags**

**Tags** are the atomic units of a character's state. They act as the "memory" of the system.

* *Examples:* WEALTHY, ORPHANED, DEGREE\_MEDICAL, CRIMINAL\_RECORD.  
* *Function:* Tags trigger future events or block them. A character with the CRIMINAL\_RECORD tag might be blocked from the POLICE\_OFFICER career.

### **2.2 Weights (The Luck System)**

**Weights** determine the probability of an event occurring based on the character's existing tags. This replaces simple percentage chances with dynamic context.

* *Scenario:* "Getting into Ivy League University."  
* *Default Weight:* 1 (Very rare).  
* *Modifier:* If character has WEALTHY tag: Weight 50 (Very likely).  
* *Modifier:* If character has POOR tag: Weight 0.5 (Extremely rare).

### **2.3 Timeline Slots**

The character's life is divided into rigid chronological buckets called **Slots**.

1. **Origin** (Birth circumstances)  
2. **Childhood** (Early development)  
3. **Education** (High School / University / Trade)  
4. **Career** (Adult profession)

## **3\. System Architecture**

The system is composed of four distinct layers, spanning from the visual configuration tools to the final narrative generation.

graph TD
    UI[Frontend Configuration UI] -->|Update Data| Store[Zustand Store + Dexie]
    Store -->|Inject Dataset| Engine[Layer 1 & 2: BioMachine]
    
    subgraph "Logic & Simulation"
        Engine -->|Layer 1: The Spine| Spine[Origin -> Edu -> Job]
        Engine -->|Layer 2: The Flesh| Flesh[Life Event Simulation]
    end
    
    Spine -->|JSON Payload| LLM[Layer 3: The Skin (LLM)]
    Flesh -->|JSON Payload| LLM
    LLM --> Output[Final Text Biography]

### **Layer 0: Frontend Configuration (UI & State)**
The system features a comprehensive set of React-based tools for managing the generative datasets.
* **State Management:** `useBioStore` (Zustand) handles the current dataset, persistence via IndexedDB (Dexie), and cascading rename logic for tags.
* **BioGraphView:** A visualization tool that maps out the logical connections between event nodes.
* **Editors:** Dedicated interfaces for managing Origins, Education, Careers, Life Events, and Tags.

### **Layer 1: The Spine (Logic & Constraints)**
This layer ensures the timeline makes sense. It uses a constraint-aware selection algorithm to resolve the timeline.
* **Input:** User Pins (e.g., "Career: Surgeon") or "Random".
* **Process:** It loads all possible events for all slots and applies filters to ensure logical continuity.
* **Logic:**
    * **Backward Propagation:** If a Career requires a tag (e.g., `DEGREE_MEDICAL`), the system filters the Education slot to only include nodes providing that tag.
    * **Forward Selection Filtering:** Once an Origin is selected, the Education slot is further filtered to only include nodes whose requirements are met by the selected Origin's provided tags.

### **Layer 2: The Flesh (Simulation)**
This layer adds richness. Once the logical spine is generated, this layer runs a probabilistic simulation for events that add flavor but don't strictly define the career path.
* **Mechanism:** It iterates through the character's age (18 to current) in 5-year increments.
* **Logic:** 70% chance of event per chunk. It uses the Tags generated in Layer 1 (and preceding Layer 2 events) to influence probabilities.

### **Layer 3: The Skin (Narrative)**
This layer converts the structured data into human-readable text using an LLM.
* **Input:** A robust JSON object containing the `spine`, `flesh`, and `tags`.
* **Process:** The `bio_writer` prompt instructs the LLM to write a biography based strictly on the provided facts.

## **4\. Data Logic & Schema**

The system relies on strict JSON definitions for the "Spine" events and simulation data.

### **4.1 Schema Definition**

#### **EventNode (Layer 1)**
Each event in the logical timeline is defined as an `EventNode`.

```typescript
interface EventNode {
  id: string;
  slot: 'ORIGIN' | 'EDUCATION' | 'CAREER';
  text: string;           // Narrative description
  requires?: string[];    // Tags required to enter this node
  provides?: string[];    // Tags granted by this node
  weights: {
    [tag: string]: number; // Modifiers (e.g., "RICH": 50)
    "DEFAULT": number;     // Baseline probability
  };
}
```

#### **LifeEvent (Layer 2)**
Simulation events that populate the "Flesh" layer.

```typescript
interface LifeEvent {
  id: string;
  text: string;
  provides?: string[];
  weights: {
    [tag: string]: number;
    "DEFAULT": number;
  };
}
```

#### **BioState (Final Output)**
The result of a generation request.

```typescript
interface BioState {
  spine: EventNode[];
  flesh: LifeEvent[];
  tags: Set<string>;
  age: number;
}
```

### **4.2 Example Data Flow**

**Scenario:** User requests a **"Taxi Driver"**.

1. **Career Node (Selected):**
   {
     "id": "taxi\_driver",
     "requires": \["DRIVING\_LICENSE"\],
     "provides": \["WORKING\_CLASS"\]
   }

2. **Constraint Check:** System scans **Education** slot for nodes providing DRIVING\_LICENSE.  
3. **Education Node (Filtered In):**
   {
     "id": "high\_school\_graduate",
     "provides": \["DIPLOMA", "DRIVING\_LICENSE"\]
   }

4. **Education Node (Filtered Out):**
   {
     "id": "boarding\_school\_no\_cars",
     "provides": \["DIPLOMA", "LATIN\_SKILLS"\]
     // Missing DRIVING\_LICENSE, so this path is pruned.
   }

## **5\. Algorithm Detail: Constraint Selection**

To support "Pinning" (Reverse Generation) and maintain logical continuity, the system uses a combination of pre-filtering and just-in-time constraints.

1. **Initialization:** Load the full dataset (Origins, Education, Careers, Events) from the store. 
2. **Backward Propagation (Pre-filtering):**
   * If a specific **Career** is pinned or if multiple careers are valid, the system identifies all `requires` tags from the valid career pool.
   * The **Education** slot is filtered to only include nodes that provide at least one of these required tags.
3. **Layer 1 Selection (The Spine):**
   * **Step A: Select Origin.** A weighted random selection is performed on all valid Origins. 
   * **Step B: Select Education.** The Education pool (pre-filtered in step 2) is further constrained: only nodes whose `requires` tags are met by the *selected* Origin are feasible. Weighted selection follows.
   * **Step C: Select Career.** The Career pool is filtered: only nodes whose `requires` tags are met by the combined tags of the selected Origin and Education are feasible. Weighted selection follows.
4. **Layer 2 Simulation (The Flesh):**
   * The system iterates from age 18 to the target age.
   * For each 5-year chunk, a probabilistic check occurs.
   * Available `LifeEvent` options are filtered to exclude already-selected events.
   * Selection uses the full tag set accumulated from the Spine and previous simulation events. 

## **6\. Development Status**

### **Implemented**

*   **Logic Engine (Layer 1):** `BioMachine.solveSpine()` implements constraint-aware selection with backward propagation.
*   **Simulator (Layer 2):** `BioMachine.simulateFlesh()` tracks age and triggers probabilistic life events in 5-year chunks.
*   **Configuration UI (Layer 0):** Full React suite for managing datasets, including the `BioGraphView` and `useBioStore` for persistence.
*   **Data Ingestion:** System loads data from IndexedDB via the `BioStore`.
*   **LLM Integration (Layer 3):** `bio_writer` prompt is available in the PromptStore.

### **Planned / In Progress**

*   **Advanced Constraints:** Full bidirectional propagation for complex pinning scenarios.
*   **Live Preview:** Direct link between the dataset editor and the LLM generation for instant feedback.

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

### **8.2 The Role of Age**

Age determines the **Simulation Depth** of the "Flesh" layer and sets the boundaries for the character's narrative timeline.

*   **The Adult Threshold:** The engine assumes that the character completes their "Spine" (Origin → Education → Career) by the age of 18.
*   **Job Timing:** Conceptually, the character enters their selected **Career** at age 18. Even if the character's target age is younger (e.g., 16), the engine currently generates a full Spine including a Career.
*   **Simulation Start:** Life Event simulation (The Flesh) **only begins at age 18**. If a character is 17 or younger, no simulation occurs, and they will only have their Spine data.
*   **Iteration:** For characters older than 18, the engine simulates life in **5-year chunks** (18-23, 23-28, etc.) until it reaches the target age.
*   **Trigger Chance:** In each 5-year chunk, there is a **70% flat chance** (currently hard-coded in `BioMachine.ts`) that a Life Event will trigger. If it triggers, a weighted selection is performed from the pool of available events.

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