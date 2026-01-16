# Implementation Plan - Gen Event functionality for Age Phases (Spine Nodes)

This plan outlines the steps to implement LLM-powered generation for neutral Spine Nodes within the Bio Generator configuration UI, mirroring the existing Life Events generator.

## Phase 1: Preparation & Testing Setup [checkpoint: 8d396a4]
- [x] Task: Create feature branch `feature/gen_spine_events_20260116` 63f1630
- [x] Task: Write failing tests for `BioDatasetEditor` to verify "Gen Events" button visibility in Age Phase tabs d49d7d1
- [x] Task: Write failing tests for `GenerateEventsDialog` to support `EventNode` (Spine Node) types d49d7d1
- [x] Task: Conductor - User Manual Verification 'Preparation & Testing Setup' (Protocol in workflow.md) 8d396a4

## Phase 2: UI Implementation
- [ ] Task: Update `BioDatasetEditor.tsx` to display the "Gen Events" button for all types, including Age Phases
- [ ] Task: Refactor `GenerateEventsDialog.tsx` to handle the `EventNode` schema and appropriate store actions
- [ ] Task: Ensure the "Gen Events" button passes the current Age Phase context to the dialog
- [ ] Task: Verify that new Spine Nodes are added to the correct store collection (`childhood`, `formative`, etc.) based on the active phase
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 3: Backend & Prompt Engineering
- [ ] Task: Create/Update API route `/api/bio-config/generate-spine` (or update existing) to handle Spine Node generation
- [ ] Task: Refine LLM prompt to focus on "neutral" milestones appropriate for specific Age Phases
- [ ] Task: Implement logic to prevent duplication of existing Spine Nodes in the prompt context
- [ ] Task: Conductor - User Manual Verification 'Backend & Prompt Engineering' (Protocol in workflow.md)

## Phase 4: Final Verification & Documentation
- [ ] Task: Run full regression suite for Bio Generator Configuration
- [ ] Task: Verify Tag registration logic for newly generated Spine Nodes
- [ ] Task: Update `docs/game_design.md` or relevant design docs to reflect the new feature
- [ ] Task: Conductor - User Manual Verification 'Final Verification & Documentation' (Protocol in workflow.md)
