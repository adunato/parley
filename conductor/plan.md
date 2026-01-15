# Plan: Bio Graph Improvements (CR028)

## Phase 1: Filter System
*Goal: Introduce a filter toolbar to control visibility of nodes based on Age Phase and Entity Type.*

- [x] Task: Create `BioGraphFilterContext` to manage visibility state (`hiddenPhases`, `hiddenTypes`, `highlightedGroupId`). d734135
- [x] Task: Create `FilterToolbar` component with checkboxes for Age Phases and "Life Events", and a Group selector. d734135
- [x] Task: Integrate `FilterToolbar` into `BioGraphView` Panel. d734135
- [x] Task: Update `BioGraphView` to pass filter state to the `bioData` preparation before layout. d734135
- [x] Task: Verify that filtering updates the graph layout and visibility dynamically. d734135
- [x] Task: Write unit tests for the reducer/context logic. d734135
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Filter System' [checkpoint: pending]

## Phase 2: Group Visualization
*Goal: Visualize bio groups within the graph using highlighting and connections.*

- [x] Task: Implement `GroupConnection` logic in `buildBioGraph` (implemented in BioGraphContent injection). d734135
- [x] Task: Update `FilterToolbar` to populate the Group selector from `bioData.groups`. d734135
- [x] Task: Handle "No Group" selection to clear highlights. d734135
- [x] Task: Verify visually that groups are distinct and connected. d734135
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Group Visualization' [checkpoint: pending]
