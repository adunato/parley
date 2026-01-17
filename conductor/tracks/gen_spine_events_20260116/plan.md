# Implementation Plan - Gen Event functionality for Age Phases (Spine Nodes)

This plan outlines the steps to implement LLM-powered generation for neutral Spine Nodes within the Bio Generator configuration UI, mirroring the existing Life Events generator.

## Phase 1: Preparation & Testing Setup [checkpoint: 8d396a4]
- [x] Task: Create feature branch `feature/gen_spine_events_20260116` 63f1630
- [x] Task: Write failing tests for `BioDatasetEditor` to verify "Gen Events" button visibility in Age Phase tabs d49d7d1
- [x] Task: Write failing tests for `GenerateEventsDialog` to support `EventNode` (Spine Node) types d49d7d1
- [x] Task: Conductor - User Manual Verification 'Preparation & Testing Setup' (Protocol in workflow.md) 8d396a4

## Phase 2: UI Implementation [checkpoint: 8955ba4]
- [x] Task: Update `BioDatasetEditor.tsx` to display the "Gen Events" button for all types, including Age Phases 8955ba4
- [x] Task: Refactor `GenerateEventsDialog.tsx` to handle the `EventNode` schema and appropriate store actions 8955ba4
- [x] Task: Ensure the "Gen Events" button passes the current Age Phase context to the dialog 8955ba4
- [x] Task: Verify that new Spine Nodes are added to the correct store collection (`childhood`, `formative`, etc.) based on the active phase 8955ba4
- [x] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md) 8955ba4

## Phase 3: Backend & Prompt Engineering [checkpoint: 1aa48ab]
- [x] Task: Create/Update API route `/api/bio-config/generate-spine` (or update existing) to handle Spine Node generation 6391472
- [x] Task: Refine LLM prompt to focus on "neutral" milestones appropriate for specific Age Phases 6391472
- [x] Task: Implement logic to prevent duplication of existing Spine Nodes in the prompt context 6391472
- [x] Task: Expose `spine_event_gen` prompt in Text Generation Settings 1aa48ab
- [x] Task: Conductor - User Manual Verification 'Backend & Prompt Engineering' (Protocol in workflow.md) 1aa48ab

## Phase 4: Final Verification & Documentation [checkpoint: 1aa48ab]
- [x] Task: Run full regression suite for Bio Generator Configuration 1aa48ab
- [x] Task: Verify Tag registration logic for newly generated Spine Nodes 1aa48ab
- [x] Task: Update `docs/game_design.md` or relevant design docs to reflect the new feature 1aa48ab
- [x] Task: Conductor - User Manual Verification 'Final Verification & Documentation' (Protocol in workflow.md) 1aa48ab
