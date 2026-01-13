# Plan: Phased Bio Generation Logic

## Phase 1: Foundation & Schema Updates
- [x] Task: Define `AgePhase` Types and Constants
- [x] Task: Update `EventNode` and `LifeEvent` interfaces in `src/lib/generator/types.ts`
- [x] Task: Update `BioStore` state to include global generation configuration (phases, intervals, probabilities)
- [x] Task: Update default JSON datasets with phase associations (Childhood, Formative, Professional, Senior)
- [~] Task: Conductor - User Manual Verification 'Foundation & Schema Updates' (Protocol in workflow.md)

## Phase 2: BioMachine Refactoring (Core Logic)
- [ ] Task: Implement Phase-Aware Spine Selection Logic (Refactor `solveSpine`)
- [ ] Task: Implement Phase-Aware Flesh Simulation Logic (Refactor `simulateFlesh`)
- [ ] Task: Refactor `BioMachine.generate` to interleave Spine and Flesh by iterating through Age Phases
- [ ] Task: Verify "Pinning" (Target Origin/Career) logic compatibility with phased approach
- [ ] Task: Conductor - User Manual Verification 'BioMachine Refactoring (Core Logic)' (Protocol in workflow.md)

## Phase 3: UI Updates (Configuration)
- [ ] Task: Refactor `BioDatasetEditor` Tabs to align with Age Phases (Childhood, Formative, Professional, Senior, Life Events, Tags)
- [ ] Task: Update `BioEntityEditor` (Spine) to implicitly or explicitly handle phase assignment based on active tab
- [ ] Task: Update `BioEntityEditor` (Flesh/LifeEvent) to support multiple Age Phase assignment
- [ ] Task: Update `BioDatasetEditor` (List View) to display "Age Phases" column/tags for Life Events
- [ ] Task: Implement basic UI in `BioConfig` to view/edit global phase settings
- [ ] Task: Conductor - User Manual Verification 'UI Updates (Configuration)' (Protocol in workflow.md)

## Phase 4: Integration & Store Migration
- [ ] Task: Update `BioStore` hydration/migration logic to handle new schema and default config
- [ ] Task: Update `ProceduralGeneratorDialog` to ensure compatibility with refactored `BioMachine`
- [ ] Task: Conductor - User Manual Verification 'Integration & Store Migration' (Protocol in workflow.md)

## Phase 5: Final Verification & Documentation
- [ ] Task: Perform comprehensive integration tests for character generation
- [ ] Task: Update `docs/game_design.md` and `docs/High-Level Design_ Procedural Character Bio Generator.md`
- [ ] Task: Conductor - User Manual Verification 'Final Verification & Documentation' (Protocol in workflow.md)
