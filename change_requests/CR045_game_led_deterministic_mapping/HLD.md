# HLD: Game Led Deterministic Mapping

## Status
Proposed

## Goals
- Establish a deterministic configuration of the symbolic mapping into the spine nodes.
- Ensure the bio-generator remains game-agnostic.
- Allow the game layer to address its needs by electing node associations.
- Allow generations to stay within required game requirements.

## Proposed Solution

### Revised Analysis: Game-Led Deterministic Mapping

To achieve a game-led, deterministic association while keeping the engine agnostic, we should move away from hardcoded "Role" or "Origin" fields in the engine and instead use a Generic Pinning System tied to a Game-Layer Registry.

### 1. The Symbolic Registry (Game Layer)

Instead of hardcoding mappings in TypeScript, we will implement a data-driven registry within the `BioStore`. This allows designers to configure the mappings via the UI without code changes.

#### Data Structure
We will add a `symbolicMappings` slice to the `BioStore`:
```typescript
export interface SymbolicMapping {
    category: string; // e.g. "PROFESSIONS", "ORIGINS"
    key: string;      // e.g. "Professor", "Urban Poor"
    nodeId: string;   // The generic Bio Node ID
}
```

#### Configuration UI
A new **Mappings** tab will be added to the Bio Generator Configuration page (`/bio-config`).
-   **Functionality**:
    -   View existing mappings grouped by Category.
    -   Add new Categories and Keys.
    -   Bind a generic Bio Node (Origin, Career, etc.) to each Key using a node selector.
-   **Storage**: Mappings are persisted alongside the rest of the World Bible data (via Dexie/Zustand).

### 2. Generalized Pinning in the BioMachine
The BioMachine will be refactored to support generic pinning based on these mappings.

*   **Request Schema**: `pinnedNodeIds: string[]`.
*   **Engine Logic**:
    -   The `generate` function accepts `pinnedNodeIds`.
    -   It acts as a **Hard Constraint**: If a node ID is pinned for a specific phase/slot, it MUST be selected (probability = 1), and all other options for that slot are removed (probability = 0).
*   **Generalized Backward Propagation**:
    -   The engine will implement a backward pass (Senior -> Professional -> Formative -> Childhood).
    -   If a phase has a pinned node, its `requires` tags are harvested.
    -   The *preceding* phase is then pruned to only include nodes that `provide` the required tags.
    -   This generalizes the previous "Professional -> Formative" logic to work across all phases.

### 3. The "Sub-Character" Workflow (Recursive Consistency)
This deterministic mapping allows the game to generate consistent siblings or relatives by sharing pinned nodes:

1.  **Identify Shared Nodes**: For "Character A," the game identifies nodes belonging to "Shared" groups (e.g., Origins, Family Structure).
2.  **Generate Character B**: The game calls the BioMachine for the new character, passing Character A's shared Node IDs into the `pinnedNodeIds` array.
3.  **Outcome**: Both characters share the exact same childhood foundation but diverge naturally in their Education and Career phases based on simulation.

### 4. Symbolic Tag Extraction
To bridge the simulation back into the game's Character object:
*   **Data Level**: Spine nodes in the bioStore will provide "Symbolic Tags" (e.g., `provides: ["SYM_ROLE_PROFESSOR"]`).
*   **Bridge Level**: A post-processor scans the resulting `BioState.tags`. If it finds `SYM_ROLE_PROFESSOR`, it deterministically sets the `character.basicInfo.role = "Professor"`.

### Summary of the Path Forward
*   **Bio-Generator**: Remains a pure logic engine. It takes a list of "Must-Have IDs" and fills in the rest of the life history (Flesh and remaining Spine) consistently.
*   **Game Layer**: Owns the mapping registry. It "elects" which nodes represent which game roles and handles the translation between the simulation output and the Character attributes.
*   **The Store**: Remains the authority for the graph structure, allowing users to import/export different world-bibles without changing the underlying engine logic.
