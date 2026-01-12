# Specification: LLM-Assisted Life Event Entity Generation

## 1. Overview
This feature introduces an LLM-assisted workflow to generate new **Life Event Entities** within the Bio-Generator system. Starting from a specific Source Entity (e.g., an "Origin" or "Education" entity), the system will generate new, distinct Life Event Entities and the specific **TAGS** (with weights) required to connect the Source Entity to these new Life Events. This expands the pool of available entities in the procedural generation graph.

## 2. Functional Requirements

### 2.1 Input Data
The generation service must accept the following inputs:
*   **Source Entity:** The full context of the input Bio-Generator Entity (e.g., an Origin definition), including its specific Tags.
*   **Context:** A list of currently connected or relevant Life Event Entities (to ensure variety and context).
*   **Quantity:** An integer specifying the number of new Life Event Entities to generate.
*   **User Prompt (Optional):** A string allowing the user to steer the thematic generation of these new entities.

### 2.2 LLM Generation Logic
*   **Entity Creation:** The LLM must generate fully formed Life Event Entities.
*   **Tag Generation:** For each generated Life Event Entity, the LLM must generate the **Tags** and **Weights** that define the connection likelihood between the Source Entity and the new Life Event Entity.
*   **Contextual Flavor:** The content of the new entities (name, description, flavor text) should be thematically derived from the Source Entity and optional user prompt.

### 2.3 Output Structure
The system must parse the LLM output into a structured format compatible with the Entity Store, containing:
*   **Life Event Entities:** A list of new entity objects (type: Life Event), each with valid schema properties (ID, name, description, etc.).
*   **Connection Tags:** A structured list of Tags (likely embedded in the entity definition or a separate link object) containing:
    *   The Tag ID/Name.
    *   The Weight (probability/likelihood of connection).

## 3. Acceptance Criteria
*   [x] **Entity Generation:** The system generates `N` valid Life Event Entities that can be stored in the Bio-Generator configuration.
*   [x] **Connection Logic:** Each generated Life Event Entity includes the necessary Tags and Weights to logically connect it to the Source Entity.
*   [x] **Schema Compliance:** The output adheres to the existing `LifeEvent` and `Tag` schemas used by "Origins", "Education", etc.
*   [x] **User Steering:** Optional prompts effectively influence the theme of the generated entities.

## 4. Out of Scope
*   Generation of other entity types (NPCs, Locations, Organizations) that are not Life Events.
*   Modifying the Source Entity itself (only new connections/entities are created).
