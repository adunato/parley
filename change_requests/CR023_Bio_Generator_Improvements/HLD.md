# CR023: Bio Generator Improvements

## Goal
To implement improvements to the bio generator system.

## Proposed Changes
- Add a "Duplicate" button to the entity items actions in each category.
- Allow ID renaming from the edit dialog.
- Implement inline uniqueness check for ID field in the edit dialog.
- Add an example of how weights work to the "Graph Legend & System Guide".

## Technical Details
- Verify where the entity list is rendered (likely `BioConfig` components).
- Update the Edit Dialog component to make ID editable and add validation logic.
- Update `bio-graph-guide.tsx` with weight explanation.
    - Add a "Logic Concepts" section or expand the existing one.
    - Explain that weights are "relative probability".
    - Provide a concrete example:
        - Event A (Default 1) vs Event B (Weight 50 via Tag).
        - Total Weight = 51.
        - Chance of A: 1/51 (~2%).
        - Chance of B: 50/51 (~98%).

## Verification Plan
### Manual Verification
- Open the Bio Configuration page.
- Expand the "Graph Legend & System Guide".
- Verify that the "Logic Concepts" section contains the new Weight explanation and example.
- Confirm that the example is clear and formatted correctly.
