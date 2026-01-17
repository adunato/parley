# High-Level Design: Bio Generator Group Auto Connections (CR031)

## 1. Executive Summary
This Change Request introduces a functionality to create **All-to-All connections** between arbitrary groups of Bio Generator nodes (e.g., linking a "Low Income" Origin group to a "Trade School" Education group). This is achieved via a UI-driven **Bulk Connection Wizard** that automatically manages "Bridge Tags" to enforce logical accessibility.

## 2. Problem Statement
Currently, creating logical paths between phases (e.g., Origin -> Education) requires tedious manual tagging.
- To connect 5 Origins to 5 specific Career paths, a user must manually add a shared tag to all 10 items and configure the `requires` logic.
- There is no visual way to "draw" a connection between a set of start points and a set of end points.

## 3. Proposed Solution

### 3.1 Core Logic: The "Bridge Tag" (Unchanged)
To connect **Group A** (Source) to **Group B** (Target) on an all-to-all basis:
1.  The system identifies or creates a unique **Bridge Tag** (e.g., `BRIDGE_GRP_A_TO_GRP_B`).
2.  **Source Update:** All nodes in **Group A** receive this tag in their `provides` array.
3.  **Target Update:** All nodes in **Group B** receive this tag in their `requires` array (default) OR receive a positive weight modifier for this tag.

### 3.2 UI Exposure: Expanded "Manage Groups" Modal
We will expand the existing `ManageGroupsModal` (`src/components/bio-config/manage-groups-modal.tsx`) to include a "Connect" tab.

#### **User Flow**
1.  **Open Dialog:** User clicks "Manage Groups".
2.  **Select "Connect" Tab:** A new tab next to "Manage" (list/edit/delete).
3.  **Select Source Groups:** A multi-select list of available groups (colored badges).
    *   *Sorting:* Groups are sorted chronologically based on the *earliest phase* of the items they contain (Childhood -> Formative -> Professional -> Senior).
4.  **Select Target Groups:** A multi-select list of available groups (sorted same as above).
5.  **Configure Connection:**
    *   *Mode:* "Hard Link" (Requires) or "Boost" (Weight).
    *   *Bridge Tag:* Option to auto-generate or input custom string.
6.  **Execute:** Click "Connect Nodes".
    *   System iterates all items in Source Groups and adds `provides: [TAG]`.
    *   System iterates all items in Target Groups and adds `requires: [TAG]` or `weights: { [TAG]: 50 }`.
    *   Toast notification confirms number of items updated.

## 4. Technical Implementation

### 4.1 UI Components
- **`ManageGroupsModal`**:
    -   Add `Tabs` (Manage | Connect).
    -   New sub-component: `GroupConnectionPanel`.
-   **`GroupConnectionPanel`**:
    -   Two columns: "From (Sources)" and "To (Targets)".
    -   Settings section at bottom.

### 4.2 Store Logic (`bioStore.ts`)
-   New Action: `connectGroups(sourceGroupIds: string[], targetGroupIds: string[], options: ConnectionOptions)`
    -   `ConnectionOptions`: `{ type: 'HARD' | 'SOFT', tagName?: string }`.
    -   Logic:
        1.  Resolves items for all group IDs.
        2.  Generates/validates tag.
        3.  Updates items state.
        4.  Registers tag in `TagManager`.
