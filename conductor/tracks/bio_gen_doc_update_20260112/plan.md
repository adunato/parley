# Implementation Plan - Update Bio Generator HLD and User Guide

## Phase 1: Analysis & Preparation
- [x] Task: Analysis - Review Current Implementation (97ca86d)
    - Review `src/lib/generator/BioMachine.ts` for exact logic of `solveSpine` and `selectWeighted`.
    - Review `src/lib/store/bioStore.ts` for data structure and persistence.
    - Review `src/components/bio-config/` to understand the UI capabilities.
    - **Deliverable:** Brief notes on discrepancies between current HLD and code.

## Phase 2: Documentation Update
- [x] Task: Doc Update - Architecture Section (16bdfa5)
    - Update `docs\High-Level Design_ Procedural Character Bio Generator.md`.
    - Revise "System Architecture" to include the Frontend Layer (UI, Graph View, Editors).
    - Update "Data Logic & Schema" to match `types.ts` (e.g., specific fields in `EventNode`).
    - **Verification:** Compare text against `src/lib/generator/types.ts`.
- [x] Task: Doc Update - User Guide & Mechanics (63054d6)
    - Add a new major section "8. User Guide & Mechanics" to `docs\High-Level Design_ Procedural Character Bio Generator.md`.
    - Write "The Mechanics of Choice": Explain the `Base * Modifiers` logic.
    - Write "Configuration & UI": Explain how to use the Bio Config Page.
    - Add concrete examples of weight calculations.
    - **Verification:** Manual review of the explanation for clarity.

## Phase 3: Review & Finalize
- [ ] Task: Conductor - User Manual Verification 'Documentation Update' (Protocol in workflow.md)
