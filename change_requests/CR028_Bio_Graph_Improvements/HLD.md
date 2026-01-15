# High-Level Design: Bio Graph Improvements (CR028)

## Overview
Enhance the Bio Graph visualization to support dynamic filtering of nodes and visual highlighting of entity groups. This aims to improve the usability of the graph when dealing with complex datasets.

## Requirements
1.  **Filtering**:
    -   Ability to toggle visibility of entire Age Phases (Childhood, Formative, etc.).
    -   Ability to toggle visibility of Life Events (non-spine nodes).
    -   Layout should update dynamically to reflect the filtered dataset.
2.  **Group Visualization**:
    -   Ability to select a specific `BioGroup` to highlight.
    -   Highlighted nodes should be visually distinct (e.g., border style).
    -   Thick connection lines should link members of the highlighted group to denote their relationship.

## Technical Approach

### 1. Visualization Context
Introduce `BioGraphFilterContext` (or extend `BioGraphContext` if appropriate) to manage the following state:
-   `hiddenPhases`: `Set<AgePhase>`
-   `hiddenTypes`: `Set<string>` (e.g., 'LIFE_EVENT')
-   `focusedGroupId`: `string | null`

### 2. Layout & Filtering
Modify `BioGraphView` to pre-process the `BioData` before passing it to `buildBioGraph`.
-   If a phase is hidden, its array in `BioData` is emptied.
-   If a type is hidden, its array is emptied.
-   This ensures `dagre` recalculates the layout without the hidden nodes (preventing gaps).

### 3. Group Highlighting
Update `buildBioGraph` to accept `focusedGroupId`.
-   **Node Styling**: If a node belongs to the focused group, add a specific class or style property.
-   **Virtual Edges**: Generate additional "Group Edges" connecting the focused nodes. These edges will have a distinct style (thick, colored) and `type: 'straight'` or `default`.
    -   *Logic*: Sort group members by age/phase, then connect sequentially? Or connect all to a central point? Sequential (Chain) seems best for a "Bio" timeline.

## User Interface
-   **Filter Toolbar**: A new component `BioGraphFilterToolbar` placed within the React Flow `Panel`.
    -   Checkboxes for Phases.
    -   Checkbox for "Life Events".
    -   Dropdown/Select for Groups.
