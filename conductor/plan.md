# Plan: Bio Graph Improvements (CR028)

## Phase 1: Filter System
*Goal: Introduce a filter toolbar to control visibility of nodes based on Age Phase and Entity Type.*

- [ ] Task: Create `BioGraphFilterContext` to manage visibility state (`hiddenPhases`, `hiddenTypes`, `highlightedGroupId`).
- [ ] Task: Create `FilterToolbar` component with checkboxes for Age Phases and "Life Events", and a Group selector.
- [ ] Task: Integrate `FilterToolbar` into `BioGraphView` Panel.
- [ ] Task: Update `BioGraphView` to pass filter state to the `bioData` preparation before layout.
    -   *Implementation Note:* Filter the arrays in `bioData` (childhood, formative, etc.) based on `hiddenPhases` and `hiddenTypes`.
- [ ] Task: Verify that filtering updates the graph layout and visibility dynamically.
- [ ] Task: Write unit tests for the reducer/context logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Filter System' [checkpoint: pending]

## Phase 2: Group Visualization
*Goal: Visualize bio groups within the graph using highlighting and connections.*

- [ ] Task: Implement `GroupConnection` logic in `buildBioGraph`.
    -   *Logic:* If a `highlightedGroupId` is active, identify all nodes in that group.
    -   *Visuals:* Add a specific style (e.g., thick border/glow) to these nodes.
    -   *Connections:* Create "Virtual Edges" connecting these nodes strictly for visualization (not DAG flow). Use a distinct style (thick, colored stroke).
- [ ] Task: Update `FilterToolbar` to populate the Group selector from `bioData.groups`.
- [ ] Task: Handle "No Group" selection to clear highlights.
- [ ] Task: Verify visually that groups are distinct and connected.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Group Visualization' [checkpoint: pending]
