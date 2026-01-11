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

The system is composed of three distinct layers, functioning as a pipeline.

graph TD  
    Input\[User Constraints: 'Job=Surgeon'\] \--\> Layer1  
      
    subgraph "Layer 1: The Spine (Logic)"  
        Direction\[Constraint Solver\]  
        Direction \--\>|Filter Invalid Paths| CoherentPath\[Origin \-\> Edu \-\> Job\]  
    end  
      
    subgraph "Layer 2: The Flesh (Simulation)"  
        CoherentPath \--\>|Tags: 'RICH', 'STRESSED'| SimEngine\[Life Event Simulator\]  
        SimEngine \--\>|Add: 'Divorce', 'Injury'| FullState\[Complete Bio Data\]  
    end  
      
    subgraph "Layer 3: The Skin (Narrative)"  
        FullState \--\>|JSON Payload| LLM\[Large Language Model\]  
        LLM \--\> Output\[Final Text Biography\]  
    end

### **Layer 1: The Spine (Logic & Constraints)**

This layer ensures the timeline makes sense. It uses a **Constraint Satisfaction Algorithm** (CSP) to resolve the timeline.

* **Input:** User Pins (e.g., "Career: Surgeon") or "Random".  
* **Process:** It loads all possible events for all slots and applies a "Sieve" to remove impossible connections.  
* **Logic:**  
  * *Constraint:* "Surgeon" requires$$\`DEGREE\_MEDICAL\`$$  
    .  
  * *Propagator:* The system looks at the **Education** slot. It removes "Art School", "Dropout", and "Engineering" because they do not provide$$\`DEGREE\_MEDICAL\`$$  
    . Only "Med School" remains valid.

### **Layer 2: The Flesh (Simulation)**

This layer adds richness. Once the logical spine is generated, this layer runs a "Parallel Track" simulation for things that don't strictly affect the career path but add flavor (Relationships, Health, Accidents).

* **Mechanism:** It iterates through the character's age in 5-year increments.  
* **Logic:** It uses the Tags generated in Layer 1 to influence these events.  
  * *Example:* If Layer 1 gave the tag DANGEROUS\_JOB, the probability of the "Work Accident" event in Layer 2 increases by 500%.

### **Layer 3: The Skin (Narrative)**

This layer converts the structured data into human-readable text.

* **Input:** A robust JSON object containing the timeline and tags.  
* **Process:** An LLM (e.g., GPT/Claude) is prompted to "Write a noir-style biography" based strictly on the provided facts, ensuring the tone matches the desired output without hallucinating conflicting details.

## **4\. Data Logic & Schema**

The system relies on strict JSON definitions for the "Spine" events.

### **4.1 Schema Definition**

Each event in the timeline (e.g., a specific job or school) is defined as an object.

interface EventNode {  
  id: string;          // Unique ID (e.g., "job\_neurosurgeon")  
  slot: string;        // "EDUCATION" | "CAREER" ...  
    
  // LOGIC GATES  
  requires?: string\[\]; // Tags required to enter this node (e.g., \["DEGREE"\])  
  provides?: string\[\]; // Tags granted by this node (e.g., \["WEALTHY", "STRESSED"\])  
    
  // PROBABILITY ENGINE  
  weights: {  
    \[tag: string\]: number; // e.g., "RICH": 50  
    "DEFAULT": number;     // Baseline probability  
  };  
}

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

## **5\. Algorithm Detail: Bidirectional Solving**

To support "Pinning" (Reverse Generation), we use **Domain Reduction**.

1. **Initialization:** Create a list of *all* possible options for every slot (Origin, Childhood, Education, Career).  
2. **Pinning:** If the user specifies "Career \= Surgeon", remove all other careers from the Career slot.  
3. **Backward Propagation:**  
   * Check the requirements of the remaining options in the Career slot.  
   * Look at the Education slot. Remove any option that does *not* provide the required tags.  
4. **Forward Propagation:**  
   * Check the requirements of the remaining options in the Education slot.  
   * Look at the Childhood slot. Remove any option that conflicts.  
5. **Selection:**  
   * Now that the domains are "clean" (contain only valid logical precursors), run the standard Weighted Random selection to pick the specific path.

## **6\. Development Status**

### **Implemented**

*   **Logic Engine (Layer 1):** `BioMachine.solveSpine()` implements the constraint solver using bi-directional propagation (though currently simplified to forward selection with filtering).
*   **Simulator (Layer 2):** `BioMachine.simulateFlesh()` tracks age and triggers probabilistic life events.
*   **Data Ingestion:** System loads `origins.json`, `education.json`, `careers.json`, and `events.json` (formerly `parallel_events.json`).
*   **LLM Integration (Layer 3):** `bio_writer` prompt is available in the PromptStore.

### **Planned / In Progress**

*   **Configuration UI:** Exposing the underlying data entities (Origins, Education, Careers) for user editing via the Settings interface.
*   **Advanced Constraints:** Full bidirectional propagation for complex pinning scenarios.

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
