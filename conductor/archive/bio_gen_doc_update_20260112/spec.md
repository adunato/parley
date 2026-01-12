# Specification: Update Bio Generator HLD and User Guide

## 1. Overview
The goal of this track is to update the existing `docs\High-Level Design_ Procedural Character Bio Generator.md` to accurately reflect the current state of the codebase (frontend and backend). Additionally, the document will be expanded to include a comprehensive User Guide targeting Game Designers and Players, specifically focusing on the mechanics of event selection and the weight/probability system.

## 2. Functional Requirements

### 2.1 Update Technical Architecture (HLD Section)
*   **Reflect Current Codebase:** Update the "System Architecture" and "Data Logic" sections to match the actual implementation in `src/lib/generator/BioMachine.ts` and `src/lib/store/bioStore.ts`.
*   **Include UI Components:** Add references to the new configuration UI (`src/app/bio-config/`) and visualization tools (`BioGraphView`), explaining how they interact with the backend data.
*   **Schema Accuracy:** Ensure JSON examples and interface definitions (e.g., `EventNode`, `BioGenerationRequest`) match `src/lib/generator/types.ts`.

### 2.2 Add User Guide (New Section)
*   **Target Audience:** Game Designers, Writers, and Players.
*   **Core Mechanics Explanation:**
    *   Provide a detailed, non-technical explanation of how the "Spine" (Origin -> Education -> Career) is generated.
    *   Explain the "Flesh" (Simulation) layer and how it differs from the Spine.
*   **The Weight System:**
    *   Create a dedicated section explaining **"How Luck Works"**.
    *   Explain the formula: `Base Weight * Modifier(Tag A) * Modifier(Tag B) = Final Probability`.
    *   Provide concrete examples (e.g., How "WEALTHY" increases the odds of "Ivy League").
*   **Configuration Guide:**
    *   Briefly explain how to use the UI tools (Graph View, Dataset Editors) to modify these values.

## 3. Non-Functional Requirements
*   **Clarity:** The User Guide section must be accessible to non-programmers.
*   **Accuracy:** All code snippets and logic descriptions must be verified against the current `main` branch.
*   **Format:** The document must remain a single file (`docs\High-Level Design_ Procedural Character Bio Generator.md`).

## 4. Acceptance Criteria
*   [ ] The "System Architecture" section accurately describes `BioMachine`, `BioStore`, and the React UI components.
*   [ ] The document contains a new "User Guide" section.
*   [ ] The "User Guide" clearly explains the mathematical logic behind weights and event selection with at least two concrete examples.
*   [ ] The document is formatted correctly in Markdown.

## 5. Out of Scope
*   Code changes to the Bio Generator itself.
*   Creating a separate document for the User Guide.
