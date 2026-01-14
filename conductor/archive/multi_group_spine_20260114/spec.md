# Specification: Multi-Group Spine Selection

## Overview
Currently, the `BioMachine` selects exactly one Spine node per age phase. With the introduction of "Groups," we want to allow multiple Spine nodes per phase—specifically, one selection per Group. This allows for multi-dimensional character backgrounds (e.g., selecting both a "Family Background" and a "Social Class" in the Childhood phase).

## Functional Requirements

### 1. Multi-Group Spine Resolution
- The `BioMachine` must identify all unique `groupId`s available for the current age phase.
- It must also identify "Ungrouped" nodes (those with no `groupId`) as a distinct pool.
- For **each** identified group (including the "Ungrouped" pool), the engine must perform a weighted selection to pick exactly one node.

### 2. Selection Independence
- All group selections within a single phase must be independent. 
- Tags provided by a node selected in "Group A" should **not** influence the requirements or weights of "Group B" within the same phase.
- All selected nodes' tags are added to the character state **after** all spine selections for that phase are complete.

### 3. Chronological Interleaving
- The engine remains phased (Childhood -> Formative -> Professional -> Senior).
- Within each phase, the sequence must be:
    1. Identify all Groups (and Ungrouped) present in the phase.
    2. Resolve one node per Group/Ungrouped pool.
    3. Update the character's tag set with all newly acquired tags.
    4. Run the "Flesh" (Life Event) simulation for that phase using the updated tag set.

### 4. Constraint Handling
- Existing constraints (Requirements and Weights) still apply to each individual selection pool.
- If a group has no feasible nodes (all blocked by requirements), that group selection is skipped for that phase.

## Non-Functional Requirements
- **Performance**: The engine should efficiently group nodes by `groupId` without significant overhead.
- **Maintainability**: The `resolvePhaseSpine` logic should be refactored to handle the new looping structure cleanly.

## Acceptance Criteria
- [ ] A character generated with multiple groups defined in a single phase receives one node from each group.
- [ ] "Ungrouped" nodes are correctly treated as a standalone group and one is selected.
- [ ] Tags from one group in a phase do not unlock/lock nodes in another group in the *same* phase.
- [ ] "Flesh" events in a phase correctly "see" the tags provided by all selected spine nodes in that phase.
- [ ] Existing "Pinning" logic (target ID constraints) still functions within the new multi-group structure.
