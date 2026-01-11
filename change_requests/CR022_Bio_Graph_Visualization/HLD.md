# HLD - CR022: Bio Generator Graph Visualization

## 1. Overview
This Change Request proposes adding a node-based graph visualization to the Bio Generator Configuration UI (`/bio-config`). This view will supplement the existing tabular views, allowing designers to visualize the complex web of dependencies (requirements) and effects (provided tags) between Origins, Education, Careers, and Life Events.

## 2. Problem Statement
The current Bio Generator uses a "Spine/Flesh" text-based constraint system.
- **Spine**: Origin -> Education -> Career
- **Connectivity**: Nodes connect via **Tags**. (e.g., `CAREER:DOCTOR` requires `DEGREE:MEDICAL`, which is provided by `EDUCATION:MED_SCHOOL`).
- **Visibility**: It is currently difficult to "see" the flow of a character's life path or identify disconnected nodes (orphans) or bottlenecks (single points of failure) using just tables.

## 3. Goals
- **Visualize** the `Origin -> Education -> Career` flow.
- **Visualize** the `Tag` dependencies (Entity -> Tag -> Entity).
- **Inspect** node details and weights on click/hover.
- **Filter** the graph to trace specific paths (e.g., "Show me all paths to become a Doctor").

## 4. Proposed Solution

### 4.1. Technology Stack
- **Graph Library**: `reactflow` (standard, highly customizable React graph library).
- **Layout Engine**: `elkjs` (Eclipse Layout Kernel) or `dagre` (likely `dagre` for simpler directional layout, or ELK for better port handling).
    - *Decision*: Start with `dagre` for simplicity in "Ranked" layouts (Left-to-Right), switch to `elkjs` if port complexity increases.
- **State Management**: Existing `bioStore`.

### 4.2. User Interface
- **New Tab**: Add a "Graph View" tab to `src/app/bio-config/page.tsx`.
- **Controls**:
    - **Direction**: Horizontal (Origin -> Career).
    - **Filter**: Dropdown to focus on a specific node and its neighbors.
    - **Layers Toggle**: Show/Hide Origins, Education, Careers, Events.

### 4.3. Data Modeling
The graph will be constructed by mapping:
- **Nodes**:
    - Entities (Origin, Education, Career).
    - Tags (Optionally, explicit Tag nodes can clarify "hubs", or we can just draw edges directly).
    - *Decision*: **Entity-Only Nodes** with edges representing tag requirements is cleaner.
        - Edge A -> B exists if A provides a tag that B requires.
        - Label the edge with the Tag name.

### 4.4. Graphical Layout
- **Rank 0**: Origins.
- **Rank 1**: Education.
- **Rank 2**: Careers.
- **Rank 3**: Life Events (Floating/Disconnected or connected via tags).

## 5. Implementation Plan

### 5.1. Dependencies
- `npm install reactflow dagre`
- `npm install -D @types/dagre`

### 5.2. Components
- `BioGraphView`: Main container.
- `CustomNode`: Optimized node component displaying ID, type, and tags.
- `ControlPanel`: Filter and layout controls.

### 5.3. Algorithms
- **Graph Builder**: A function `buildGraph(storeData, filters)` that transforms `BioData` into React Flow `nodes` and `edges`.

## 6. Verification
- Manual verification of graph rendering.
- Verify "Doctor" requires "Medical Degree" visual connection.
- Verify filtering reduces noise.
