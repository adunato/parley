# Implementation Plan - CR025 Bio Generator Configuration Update

## Phase 1: Analysis & Data Verification
- [x] Task: Analyze existing Bio Config Table and Data Structure [analysis: 447b496]
    -   **Goal:** Identify the exact component rendering the table and check if the 'influence' data is already available in the props/state.
    -   **Files:** `src/components/bio-config/`, `src/lib/types.ts`
    -   **Step 1:** Read `src/components/bio-config/` to find the main table component.
    -   **Step 2:** Inspect the TypeScript interfaces to see if tag influence weights are defined.
    -   *Note:* Identified `BioDatasetEditor` in `src/components/bio-config/bio-dataset-editor.tsx`. Confirmed `EventNode` and `LifeEvent` in `src/lib/generator/types.ts` already have a `weights` field.

## Phase 2: Implementation
- [x] Task: Update Type Definitions (if needed) [skipped: 447b496]
    -   **Goal:** Ensure the data model supports `tag` and `weight` properties for configuration items.
    -   **Context:** Data already exists in `src/lib/generator/types.ts`.
    -   **Sub-tasks:**
        -   Write Tests (Verification of type usage)
        -   Implement Feature (Update interface)

- [x] Task: Update Bio Config Table UI [6a28deb]
    -   **Goal:** Add the "Influenced by" column and render the data.
    -   **Context:** Modify the identified React component.
    -   **Sub-tasks:**
        -   Write Tests (Component test for new column)
        -   Implement Feature (Add column header and cell rendering logic for `TAG:weight` format)

## Phase 3: Verification [checkpoint: 4b299e9]
- [x] Task: Verify and Build [756b6dc]
    -   **Goal:** Ensure the UI looks correct and the project builds.
    -   **Action:** Run `npm run build` and visually check the component (if possible via Storybook or running app).
    -   **Sub-tasks:**
        -   Run Build
        -   Manual Verification (Check UI)
