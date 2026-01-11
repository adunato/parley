# CR023: Bio Generator Improvements

## Goal
To implement improvements to the bio generator system.

## Proposed Changes
- Add a "Duplicate" button to the entity items actions in each category.
- Allow ID renaming from the edit dialog.
- Implement inline uniqueness check for ID field in the edit dialog.

## Technical Details
- Verify where the entity list is rendered (likely `BioConfig` components).
- Update the Edit Dialog component to make ID editable and add validation logic.
