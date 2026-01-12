# Implementation Plan - CR026 Bio Generator Tags Management

## Phase 1: Analysis & Data Foundation [checkpoint: c3d7094]
- [x] Task: Investigate Store and JSON Data Relationship [analysis: f17c39e]
    -   **Goal:** Confirm if JSON files are legacy and verify current store structure for bio entities.
    -   **Action:** Inspect `src/lib/store.ts`, `src/lib/entityStore.ts` and their interaction with `src/lib/generator/data/*.json`.
    -   *Result:* JSON files are used as initial seed data in `onRehydrateStorage` in `useBioStore` (`src/lib/store/bioStore.ts`). The store uses Dexie for persistence. Tags are currently implicit in `provides`, `requires`, and `weights` keys of entities.
- [x] Task: Define Tag Data Model [c7882d6]
    -   **Goal:** Create a consistent data model for Tags in the store.
    -   **Sub-tasks:**
        -   Write Tests (Verify store can hold and persist new Tag entities)
        -   Implement Feature (Update Zustand/Dexie schema)
- [x] Task: Conductor - User Manual Verification 'Analysis & Data Foundation' (Protocol in workflow.md) [c3d7094]

## Phase 2: Core Logic & Backend
- [~] Task: Implement Tag Reverse-Lookup Logic
    -   **Goal:** Create functions to identify which entities Provide, Require, or are Influenced by a specific tag.
    -   **Sub-tasks:**
        -   Write Tests (Verify lookup accuracy for all relationship types)
        -   Implement Feature (Add helper functions to a new `tag-utils.ts`)
- [ ] Task: Conductor - User Manual Verification 'Core Logic & Backend' (Protocol in workflow.md)

## Phase 3: UI Implementation
- [ ] Task: Create Tags Management Tab
    -   **Goal:** Integrate the "Tags" tab into the Bio Config layout.
    -   **Sub-tasks:**
        -   Write Tests (Verify tab appears and table renders)
        -   Implement Feature (Update `src/app/bio-config/page.tsx` and related components)
- [ ] Task: Implement Tag Edit & CRUD Dialogs
    -   **Goal:** Allow users to Create, Edit, and Delete tags with appropriate dialogs.
    -   **Sub-tasks:**
        -   Write Tests (Verify CRUD operations update the store correctly)
        -   Implement Feature (Create `TagEditorDialog` and integrate into the table)
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 4: Finalization & Cleanup
- [ ] Task: Remove Legacy JSON Files (Conditional)
    -   **Goal:** Clean up the codebase if Phase 1 confirms files are redundant.
- [ ] Task: Conductor - User Manual Verification 'Finalization & Cleanup' (Protocol in workflow.md)
