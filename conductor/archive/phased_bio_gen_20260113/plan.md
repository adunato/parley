# Plan: Phased Bio Generation Logic

## Phase 1: Foundation & Schema Updates
- [x] Task: Define `AgePhase` Types and Constants
- [x] Task: Update `EventNode` and `LifeEvent` interfaces in `src/lib/generator/types.ts`
- [x] Task: Update `BioStore` state to include global generation configuration (phases, intervals, probabilities)
- [x] Task: Update default JSON datasets with phase associations (Childhood, Formative, Professional, Senior)
- [x] Task: Conductor - User Manual Verification 'Foundation & Schema Updates' (Protocol in workflow.md) [checkpoint: 0ac144f]

## Phase 2: BioMachine Refactoring (Core Logic) [checkpoint: 15dea7a]
- [x] Task: Implement Phase-Aware Spine Selection Logic (Refactor `solveSpine`)
- [x] Task: Implement Phase-Aware Flesh Simulation Logic (Refactor `simulateFlesh`)
- [x] Task: Refactor `BioMachine.generate` to interleave Spine and Flesh by iterating through Age Phases
- [x] Task: Verify "Pinning" (Target Origin/Career) logic compatibility with phased approach
- [x] Task: Conductor - User Manual Verification 'BioMachine Refactoring (Core Logic)' (Protocol in workflow.md)

## Phase 3: UI Updates (Configuration) [checkpoint: 794deca]
- [x] Task: Refactor `BioDatasetEditor` Tabs to align with Age Phases (Childhood, Formative, Professional, Senior, Life Events, Tags)
- [x] Task: Update `BioEntityEditor` (Spine) to implicitly or explicitly handle phase assignment based on active tab
- [x] Task: Update `BioEntityEditor` (Flesh/LifeEvent) to support multiple Age Phase assignment
- [x] Task: Update `BioDatasetEditor` (List View) to display "Age Phases" column/tags for Life Events
- [x] Task: Implement basic UI in `BioConfig` to view/edit global phase settings
- [x] Task: Conductor - User Manual Verification 'UI Updates (Configuration)' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'UI Updates (Configuration)' (Protocol in workflow.md)

## Phase 4: Integration & Store Migration [checkpoint: 953ccc6]
- [x] Task: Update `BioStore` hydration/migration logic to handle new schema and default config
- [x] Task: Update `ProceduralGeneratorDialog` to ensure compatibility with refactored `BioMachine`
- [x] Task: Conductor - User Manual Verification 'Integration & Store Migration' (Protocol in workflow.md)

## Phase 5: Final Verification & Documentation [checkpoint: a04bd3a]
- [x] Task: Perform comprehensive integration tests for character generation
- [x] Task: Update `docs/game_design.md` and `docs/High-Level Design_ Procedural Character Bio Generator.md`
- [x] Task: Conductor - User Manual Verification 'Final Verification & Documentation' (Protocol in workflow.md)

## Phase 6: Feedback & Polish [checkpoint: b36207d]
- [x] Task: Refine `BioDatasetEditor` (Hide "Age Phases" column for Spine, Filter data by phase)
- [x] Task: Enable Senior Tab with filtered Life Events editor (Reverted: Moving to Spine model)
- [x] Task: Fix `BioEntityEditor` (Disable phase editing for Spine, Fix Multi-select for Life Events)
- [x] Task: Implement Senior Spine Slot (Schema: `SlotType`, Store: `senior` array, Engine: `BioMachine` support)
- [x] Task: Update Senior Tab in `BioConfig` to use new Senior Spine store
- [x] Task: Conductor - User Manual Verification 'Feedback & Polish' (Protocol in workflow.md)

## Phase 7: Visualization Updates [checkpoint: 559e936]
- [x] Task: Update `BioGraphView` to include Senior Spine nodes
- [x] Task: Update Graph Legend/Guide to include Senior category and color
- [x] Task: Conductor - User Manual Verification 'Visualization Updates' (Protocol in workflow.md)

## Phase 8: Terminology Standardization
- [x] Task: Rename Data Files (`origins.json` -> `childhood.json`, etc.) and update internal slot values
- [x] Task: Update `SlotType` and interfaces in `types.ts`
- [x] Task: Refactor `BioStore` to use `childhood`, `formative`, `professional` properties
- [x] Task: Refactor `BioMachine` and Generator Logic
- [x] Task: Update UI Components (`BioDatasetEditor`, `BioGraphView`, etc.) and Labels
- [x] Task: Update Tests and Documentation
