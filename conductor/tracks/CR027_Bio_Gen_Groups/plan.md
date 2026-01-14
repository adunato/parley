# Plan: Bio Generator - Multi-Select, Grouping, and Management

## Phase 1: Foundation - Data Schema & State Management
*Goal: Update the core data structures to support BioGroups and entity associations.*

- [ ] Task: Update `src/lib/generator/types.ts` to include `BioGroup` and update `BioData` and `EventNode`.
- [ ] Task: Update `src/lib/store.ts` (or relevant store file) to handle the new `groups` array in `BioData` and ensure persistence.
- [ ] Task: Write unit tests for store actions (add group, remove group, assign entity to group).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md)

## Phase 2: UI Selection Logic - Grid Enhancements
*Goal: Add multi-select checkboxes and basic action bar to the existing grids.*

- [ ] Task: Implement selection state logic in `BioDatasetEditor` and `TagDatasetEditor`.
- [ ] Task: Add a checkbox column to the `DataTable` components within the editors.
- [ ] Task: Create a reusable `SelectionToolbar` component (Delete button, and slot for contextual actions).
- [ ] Task: Write tests for selection state (selecting one, selecting many, select all).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Selection Logic' (Protocol in workflow.md)

## Phase 3: Grouping Workflow & Management
*Goal: Implement the "Group" action, "Create Group" modal, and "Manage Groups" modal.*

- [ ] Task: Create the `CreateGroupModal` (simple Name/Description form).
- [ ] Task: Implement the "Group" action in the toolbar (only for spine entities) that triggers the modal and updates selected entities.
- [ ] Task: Create the `ManageGroupsModal` to list, rename, and delete existing groups.
- [ ] Task: Add the "Group" column to the Age Phase grids to display the assigned group name.
- [ ] Task: Write integration tests for the grouping workflow (create group -> entities update -> display name).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Grouping Workflow' (Protocol in workflow.md)

## Phase 4: Bulk Delete & Cleanup
*Goal: Implement multi-delete across all grids and final UI polish.*

- [ ] Task: Implement the "Delete" action in the `SelectionToolbar` for bulk removal of entities.
    -   *Sub-task:* Implement confirmation dialog for bulk delete.
    -   *Sub-task:* Remove confirmation dialog from existing single-delete actions.
- [ ] Task: Ensure deleting a group (in Manage Groups) correctly clears `groupId` from all referencing entities.
- [ ] Task: Final UI/UX review (consistency, mobile responsiveness, empty states).
- [ ] Task: Verify overall code coverage for the new features.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
