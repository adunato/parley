# Plan: Multi-Group Spine Selection

This plan refactors the `BioMachine` engine to support selecting multiple spine nodes per age phase, partitioned by groups.

## Phase 1: Core Engine Refactor [checkpoint: e7f3fc9]
- [x] Task: TDD - Refactor `resolvePhaseSpine` to handle a provided pool of nodes and perform a single weighted selection. 56e431b
- [x] Task: TDD - Implement logic in `generate()` to identify unique groups (including an 'ungrouped' pool) within an age phase. 56e431b
- [x] Task: TDD - Update the phase loop in `generate()` to resolve exactly one node per group. 56e431b
- [x] Task: TDD - Ensure intra-phase selection independence (selected tags are only applied to the state *after* all groups in the phase are processed). 56e431b
- [x] Task: Conductor - User Manual Verification 'Core Engine Refactor' (Protocol in workflow.md)

## Phase 2: Constraint & Interaction [ ]
- [x] Task: TDD - Verify that "Flesh" simulation iterations receive the aggregate tags from all selected groups in the phase. 1f796f8
- [x] Task: TDD - Ensure Backward Propagation (Career -> Education pruning) remains functional with multi-group selection. b83b11c
- [x] Task: TDD - Validate that "Pinning" (requesting a specific node ID) correctly forces selection in its respective group while allowing other groups to resolve normally. b83b11c
- [x] Task: Conductor - User Manual Verification 'Constraint & Interaction' (Protocol in workflow.md)

## Phase 3: Final Integration & UI Testing [ ]
- [ ] Task: Run full regression tests for `BioMachine`.
- [ ] Task: Manual verification: Generate a character with multiple groups defined in "Childhood" and verify the JSON state contains nodes from each.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Integration & UI Testing' (Protocol in workflow.md)
