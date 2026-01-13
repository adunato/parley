# Implementation Plan: Dropdown for Tag Selection

## Phase 1: Research and Component Setup
- [x] Task: Audit existing UI components in `src/components/ui` for a suitable Combobox or Searchable Select.
- [x] Task: Create a reusable `TagSelector` component that wraps the selected UI component and integrates with `useBioStore` for tag suggestions.
- [x] Task: Implement the "Creatable" logic within `TagSelector` to allow new tag IDs.

## Phase 2: BioEntityEditor Integration
- [x] Task: Replace the `provides` tag input in `BioEntityEditor` with the new `TagSelector`.
- [x] Task: Replace the `requires` tag input in `BioEntityEditor` with the new `TagSelector`.
- [x] Task: Verify that adding both existing and new tags works correctly for Origins, Education, and Careers.
- [x] Task: Conductor - User Manual Verification 'Phase 2: BioEntityEditor Integration' (Protocol in workflow.md)

## Phase 3: WeightEditor Integration
- [x] Task: Replace the tag selection input in `WeightEditor` with the new `TagSelector`.
- [x] Task: Verify that adding weight modifiers for both existing and new tags works correctly.
- [x] Task: Conductor - User Manual Verification 'Phase 3: WeightEditor Integration' (Protocol in workflow.md)

## Phase 4: Final Verification and Documentation
- [x] Task: Perform a final sweep of the Bio Config UI to ensure style consistency.
- [x] Task: Update `/design` or `game_design.md` if the component structure has changed significantly.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification and Documentation' (Protocol in workflow.md)