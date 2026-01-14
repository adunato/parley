# Specification: Bio Generator - Multi-Select, Grouping, and Management

## 1. Overview
This track introduces multi-selection capabilities to the data grids within the Bio Generator configuration UI. It enables bulk operations, specifically "Delete" for all grids and a new "Group" operation for Spine entities (Age Phases). Users will be able to group related entities, persist these groups, and manage them via a dedicated modal.

## 2. Functional Requirements

### 2.1. Data Schema Updates
*   **New Entity:** Define `BioGroup` interface:
    *   `id`: string (UUID)
    *   `name`: string
    *   `description`: string (optional)
*   **BioData Update:** Add `groups: BioGroup[]` to the `BioData` interface.
*   **Entity Update:** Add optional `groupId: string` to `EventNode` (Spine entities).
*   **Constraints:**
    *   An entity can belong to only one group.
    *   Grouping is restricted to Spine items (Age Phases).
    *   Assigning an entity to a new group replaces any existing group association.

### 2.2. UI Enhancements (Grids)
*   **Scope:** Apply to `BioDatasetEditor` (Spine/Age Phases) and `TagDatasetEditor` (Tags), and `LifeEvent` editor if applicable.
*   **Selection Column:** Add a checkbox column to the left of these grids to allow selecting one or multiple rows.
*   **Action Bar:** Introduce a toolbar above the grid that appears or becomes active when items are selected.
    *   **Delete Action:** Available for all grids. Deletes all selected items.
    *   **Group Action:** Available ONLY for Spine/Age Phase grids. Triggers the grouping workflow.
    *   **Manage Groups:** A persistent button to open the Group Management Modal.
*   **Display:** Add a column to Spine grids showing the assigned Group Name (if any).

### 2.3. Grouping Workflow
*   **Create Group:**
    *   Triggered by selecting items and clicking "Group".
    *   Opens a small modal prompting for:
        *   **Group Name** (Required)
        *   **Description** (Optional)
    *   Upon confirmation, creates a new `BioGroup`, assigns selected entities to it, and clears the selection.

### 2.4. Group Management
*   **Manage Groups Modal:**
    *   Triggered by a "Manage Groups" button in the action bar.
    *   Displays a list of all existing groups.
    *   **Capabilities:**
        *   **Rename:** Edit the name of an existing group.
        *   **Delete:** Delete a group. (Logic: Should likely un-group the entities rather than delete the entities themselves).

### 2.5. Any Other Business (AOB)
*   **Deletion UX:**
    *   **Single Item Deletion:** Deleting a single item (via the existing row action) should **NOT** require a confirmation dialog. It should happen immediately.
    *   **Bulk Deletion:** Deleting multiple items (via the new Action Bar) **MUST** require a confirmation dialog ("Are you sure you want to delete X items?").

## 3. Non-Functional Requirements
*   **State Management:** Updates must be persisted to the `useBioStore` (Zustand/Dexie) immediately.
*   **Performance:** Selection of many items should not cause UI lag.
*   **Consistency:** The visual style of the selection and toolbar should match the existing UI design (Tailwind/shadcn).

## 4. Acceptance Criteria
*   [ ] `BioData` schema is updated to include `groups` and `EventNode.groupId`.
*   [ ] Multi-select checkboxes appear on Age Phase, Life Event, and Tag grids.
*   [ ] "Delete" button works for multiple selected items across all grids (with confirmation).
*   [ ] Single item delete works immediately (without confirmation).
*   [ ] "Group" button appears ONLY on Age Phase grids and is active when items are selected.
*   [ ] "Create Group" modal allows creating a group with Name/Description and assigns selected items.
*   [ ] "Manage Groups" modal is accessible via a persistent button and allows renaming and deleting groups.
*   [ ] Deleting a group removes the `groupId` from associated entities (does not delete the entities).
*   [ ] The grid displays a "Group" column showing the correct group name for entities.
