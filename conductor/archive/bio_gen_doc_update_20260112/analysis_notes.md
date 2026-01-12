# Analysis Notes: Bio Generator HLD vs. Implementation

## 1. Discrepancies
- **Constraint Propagation:** The logic for "Forward Propagation" (filtering Origins based on Education requirements) is currently disabled in `BioMachine.ts` because it was too aggressive. Instead, the engine filters *Education* options based on the *selected* Origin during the selection phase. The HLD should reflect this "Select-then-Filter" approach for forward dependencies.
- **Pinning:** `BioMachine` supports pinning `targetOriginId` and `targetCareerId`. The HLD should explicitly mention these as part of the `BioGenerationRequest`.

## 2. Architecture Updates
- **Frontend Layer:** The system now includes a robust configuration UI.
    - **`useBioStore` (Zustand):** Manages the state of the dataset, handles persistence via Dexie, and implements cascading renames for tags.
    - **`BioGraphView`:** A React-based visualization of the event nodes and their relationships.
    - **`BioDatasetEditor`:** CRUD interfaces for modifying origins, education, and careers.
- **Tag Management:** Tags are no longer just strings; they are entities (`Tag` interface) with optional descriptions.

## 3. Mechanics & Logic
- **`selectWeighted` Formula:** 
    - `FinalWeight = DefaultWeight * Modifier1 * Modifier2 * ...`
    - `DefaultWeight` is taken from `weights.DEFAULT`.
    - Modifiers are looked up in the `weights` object using active tags.
- **Simulation Layer (Flesh):**
    - Runs from age 18 to current age in 5-year increments.
    - 70% chance (`Math.random() > 0.3`) of an event per chunk.
    - Events can provide tags that affect subsequent event probabilities in the simulation.

## 4. Schema Verification
- `EventNode` and `LifeEvent` match the `types.ts` implementation exactly.
- `BioState` includes `spine`, `flesh`, `tags`, and `age`.
