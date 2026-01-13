# Specification: Phased Bio Generation Logic

## Overview
This track involves a significant refactoring of the `BioMachine` logic and the bio-generation process. Currently, the system generates the entire "Spine" (Origin, Education, Career) at once and then simulates "Flesh" (Life Events) chronologically. 

The new approach introduces **Age Phases**. The generation will interleave Spine and Flesh: for each phase, the engine will resolve the relevant Spine node (if applicable) and then simulate several iterations of Life Events within that phase's age boundary, using configurable time intervals and probabilities.

## Functional Requirements

### 1. Age Phase System
- Define a fixed set of **Age Phases**:
    - **Childhood (0–18)**: Primary Spine node: `ORIGIN`.
    - **Formative (18–25)**: Primary Spine node: `EDUCATION`.
    - **Professional (25–65)**: Primary Spine node: `CAREER`.
    - **Senior (65+)**: No primary Spine node.
- Each phase has a configurable:
    - `startAge` and `endAge`.
    - `simulationInterval` (e.g., 5 years).
    - `eventChance` (probability of an event triggering in an interval).

### 2. Refactored Generation Logic (Interleaved)
- The `BioMachine.generate()` method will iterate through these phases sequentially.
- **Per Phase Logic:**
    1. **Spine Resolution**: If the phase has an associated Spine slot (Origin, Education, or Career), the engine selects a node using the existing weighted random logic, respecting constraints from previous phases.
    2. **Flesh Simulation**: The engine runs simulation iterations from `startAge` to `endAge` (or target age) based on the `simulationInterval`.
    3. **Pool Filtering**: 
        - **Spine Events**: Selected only if their single assigned phase matches the current phase.
        - **Flesh Events**: Selected if the current phase is present in their list of allowed phases.
    4. **Tag Accumulation**: Tags from both Spine and Flesh nodes are accumulated and influence subsequent selections in the same phase and future phases.

### 3. Global Configuration
- Introduce a global configuration object (likely in `BioStore`) to manage:
    - Age phase boundaries.
    - Default simulation intervals.
    - Default event probabilities.

### 4. Data Schema Updates
- **`EventNode` (Spine)**: Update to associate with a **single** Age Phase (e.g., `phase: AgePhase`).
- **`LifeEvent` (Flesh)**: Update to associate with **multiple** Age Phases (e.g., `phases: AgePhase[]`).
- **`BioStore`**: Update to store and manage the new global generation settings.

### 5. Configuration UI Updates
- **Tab Reorganization**: 
    - Rename/Refactor existing Spine tabs (Origins, Education, Careers) to match the Age Phases: **Childhood**, **Formative**, **Professional**, **Senior**.
    - Maintain **Life Events** and **Tags** tabs.
- **Event Editors**:
    - **Spine Editors**: Implicitly assigned to the phase of the active tab.
    - **Life Events Editor**: Add UI controls to assign Age Phases (Multi-Select).
- **List Views**:
    - Update the "Life Events" configuration table to display the assigned Age Phases (e.g., as tags under a new "Age Phases" column).

## Non-Functional Requirements
- **Backwards Compatibility**: The existing "Pinning" (Target Career/Origin) must still function within the new phased loop.
- **Performance**: The simulation loop should remain efficient, even with finer-grained intervals.

## Acceptance Criteria
- [ ] Character generation follows a phase-by-phase chronological loop.
- [ ] Spine nodes are selected at the correct age intervals.
- [ ] Life events are only selected from pools associated with the current phase.
- [ ] Spine events are restricted to a single phase; Flesh events can span multiple phases.
- [ ] Configuration UI tabs reflect Age Phases (Childhood, Formative, etc.) instead of generic Spine types.
- [ ] Changing global phase boundaries or intervals correctly impacts generation.
- [ ] "Pinning" a Career or Origin still results in a valid biography.
- [ ] Users can view and edit Age Phase associations in the Configuration UI.

## Out of Scope
- Dynamic user-defined phases via the UI (for this initial version).
- Refactoring the LLM "Skin" layer (should work with the resulting `BioState`).
