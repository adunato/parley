# High Level Design: Bio Generator Graph Connections (CR030)

## 1. Overview
This change request focuses on enabling users to create logical connections between bio entities directly on the graph visualization using drag-and-drop interactions.

## 2. Problem Statement
Currently, the graph is read-only regarding connections. Users cannot intuitvely add dependencies (`requires`) or probabilistic weights (`weights`) by interacting with the nodes.

## 3. Proposed Solution
Implement a "Drag and Drop" connection workflow in the React Flow graph.
*   **Trigger**: User drags a connection line from a Source Node (handle) to a Target Node (handle).
*   **Logic**: The system allows connecting a tag `PROVIDED` by the Source to the Target's `REQUIRES` or `WEIGHTS` list.

## 4. Detailed Design

### 4.1. Interaction Flow
1.  **User Action**: Drag generic connection from Node A (Source) to Node B (Target).
2.  **System Check**:
    *   Identify `Source.Provides` tags.
    *   Identify `Target.Requires` and `Target.Weights` tags.
    *   **Filter Candidates**: Find tags in `Source.Provides` that are **NOT** present in `Target.Requires` AND **NOT** present in `Target.Weights`.
3.  **Decision Points**:
    *   **Case 0 (No Candidates)**: Show a feedback message (e.g., "No compatible tags to connect").
    *   **Case 1 (Single Tag, Missing in Both)**:
        *   Prompt User: "Select Category: [Requires] or [Weights]".
    *   **Case 2 (Multiple Tags)**:
        *   Prompt User: "Select Tag" AND "Select Category".
4.  **Execution**:
    *   Update the **Target Node** data to include the selected tag in the selected category.
    *   Refresh the graph to show the new connection (handled automatically by React Flow edge rebuilding on data change).

### 4.2. UI Components
*   **`ConnectionSelectionDialog`**: A new modal component.
    *   **Inputs**:
        *   `sourceNode`: The starting node of the connection.
        *   `targetNode`: The ending node.
        *   `candidateTags`: List of valid tags.
    *   **Selection**:
        *   Tag Selection (Radio group or Select, if > 1 candidate).
        *   Category Selection (Radio group: "Requires" vs "Weights").
            *   *Note*: Weights might need a default value (e.g., 10) or an input field. We will default to `10` for now or allow simple input.
    *   **Actions**: "Confirm" and "Cancel".

### 4.3. Data Logic
*   **Validation**: Ensure circular dependencies are not created (optional for now, but good practice).
*   **Store Update**:
    *   Retrieve the full list for the Target Node's type (e.g., `professional` list).
    *   Find the specific item.
    *   Modify `requires` or `weights` array/object.
    *   Call `setData` to trigger global state update.

## 5. Verification Plan

### 5.1 Manual Verification
1.  **Scenario: Connect New Tag**
    *   Find Node A (`provides: ["TagX"]`) and Node B (has no "TagX").
    *   Drag connection A -> B.
    *   Verify Dialog appears with "TagX" pre-selected (or only option).
    *   Select "Requires". Confirm.
    *   Verify Node B now shows "TagX" in Requires badge.
    *   Verify visual edge appears.

2.  **Scenario: Connect Weighted Tag**
    *   Repeat above, select "Weights".
    *   Verify Node B shows "TagX" in Weights section.

3.  **Scenario: No Candidates**
    *   Connect Node A to B where B already requires "TagX".
    *   Verify no action or user feedback (e.g., "Already connected").

### 5.2 Automated Tests
*   (If feasible) specific unit tests for the candidate filtering logic.
