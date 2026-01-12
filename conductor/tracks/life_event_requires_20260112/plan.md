# Plan: Optional "Requires" Field for Life Events

## Phase 1: Types, Schemas & Store Updates [checkpoint: 200f5fc]
- [x] Task: Update Type Definitions 18724bc
    - [x] Sub-task: Add `requires?: string[]` to `LifeEvent` interface in `src/lib/generator/types.ts`.
- [x] Task: Update Zod Schemas 62e59f5
    - [x] Sub-task: Add `requires: z.array(z.string()).optional()` to `lifeEventSchema` in `src/lib/generator/schemas.ts`.
- [x] Task: Update BioStore Cascading Logic fbe3043
    - [x] Sub-task: Update `updateTag` rename logic in `src/lib/store/bioStore.ts` to include `requires` field for `lifeEvents`.
    - [x] Sub-task: Update `deleteTag` or re-harvest logic if necessary to handle `requires` cleanup.
- [x] Task: Conductor - User Manual Verification 'Types, Schemas & Store Updates' (Protocol in workflow.md) 200f5fc

## Phase 2: Core Logic Implementation (BioMachine)
- [x] Task: Write Failing Tests for BioMachine Filtering 870bbf7
    - [x] Sub-task: Create or update `BioMachine` tests to verify that `LifeEvent` items with unmet `requires` tags are filtered out.
- [x] Task: Implement Filtering Logic in BioMachine 870bbf7
    - [x] Sub-task: Modify `BioMachine.ts` to filter `LifeEvent` candidates based on character's current tags.
- [x] Task: Verify Tests and Coverage 870bbf7
    - [x] Sub-task: Run tests and ensure >80% coverage for the new filtering logic.
- [ ] Task: Conductor - User Manual Verification 'Core Logic Implementation (BioMachine)' (Protocol in workflow.md)

## Phase 3: UI Implementation
- [ ] Task: Update BioEntityEditor UI
    - [ ] Sub-task: Modify `src/components/bio-config/bio-entity-editor.tsx` to display and allow editing of the `requires` field when the type is `LIFE_EVENT`.
    - [ ] Sub-task: Ensure consistency with how `requires` is edited for Spine entities (Origins, Careers, etc.).
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 4: LLM Integration & Verification
- [ ] Task: Update LLM Prompting
    - [ ] Sub-task: Update the generation prompt in `src/lib/generator/` (likely within the service using `lifeEventGenerationSchema`) to instruct the LLM on how to use the `requires` field meaningfully.
- [ ] Task: End-to-End Verification
    - [ ] Sub-task: Run the bio-generator test script or use the UI to verify that the LLM generates requirements and the engine respects them.
- [ ] Task: Conductor - User Manual Verification 'LLM Integration & Verification' (Protocol in workflow.md)
