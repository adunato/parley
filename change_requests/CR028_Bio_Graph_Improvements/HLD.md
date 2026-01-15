# High-Level Design: Bio Graph Improvements (CR028)

## Overview
Enhance the Bio Graph visualization to support dynamic filtering of nodes and visual highlighting of entity groups. This aims to improve the usability of the graph when dealing with complex datasets.

## Requirements
1.  **Filtering**:
    -   Ability to toggle visibility of entire Age Phases (Childhood, Formative, etc.).
    -   Ability to toggle visibility of Life Events (non-spine nodes).
    -   Layout should update dynamically to reflect the filtered dataset.
2.  **Group Visualization**:
    -   **Persistent Visualization**: Groups should be always visible (no dropdown selection).
    -   **Color Coding**: Each group is assigned a distinct (deterministic) color.
    -   **Visual Indication**:
        -   Nodes belonging to a group display a visual indicator (e.g., colored border/stripe) matching their group color.
        -   Nodes in the same group are connected by colored "virtual edges" to show the relationship sequence.

## Technical Approach

### 1. Visualization Context
Introduce `BioGraphFilterContext` to manage:
-   `hiddenPhases`: `Set<AgePhase>`
-   `hiddenTypes`: `Set<string>` (e.g., 'LIFE_EVENT')
*Removed `focusedGroupId` as visualization is now global.*

### 2. Layout & Filtering
-   Pre-process `BioData` to remove hidden nodes before layout (same as before).

### 3. Group Highlighting (Refined)
-   **Color Utility**: Implement a helper `getGroupColor(groupId: string)` that returns a consistent HSL/Hex color based on the ID string hash.
-   **Edges**: In `BioGraphContent`, iterate through *all* defined groups.
    -   Filter visible nodes belonging to that group.
    -   Sort them by Phase/Age.
    -   Generate edges between them with `style: { stroke: groupColor }`.
-   **Node Styling**:
    -   Pass `groupId` and `groupName` to `BioNode`.
    -   `BioNode` uses `getGroupColor(groupId)` to render a colored marker (e.g., a left colored border or a colored badge).

## User Interface
-   **Filter Toolbar**:
    -   Checkboxes for Phases.
    -   Checkbox for "Life Events".
    -   *Removed Group Selector*.
