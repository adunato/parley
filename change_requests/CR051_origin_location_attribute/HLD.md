# Origin Location Attribute

## Status
Draft

## Goals
- Introduce "origin location / comes from" as a character attribute.
- Display "Origin Location" in "Basic Information".
- Extract "Origin Location" from "Procedural Character Generator" or allow manual input.
- Split "Origin Location" into a Faker-friendly format: "Country of Origin", "State / Region", "Town".
- Use the same drop-down values for "Country of Origin" and "State / Region" in "Basic Information" as used in "Procedural Character Generator".
- Pre-populate "Procedural Character Generator" with name, gender, and "origin location" information when accessed from the "Basic Information" character screen.

## Proposed Solution
- Update character data model (`src/lib/types/character.ts` or similar) to include `originLocation` with sub-fields `country`, `stateRegion`, and `town`.
- Extend the "Basic Information" UI (e.g., `src/app/character-config/...` or `src/components/...`) to display and edit these fields using existing drop-downs.
- Modify "Procedural Character Generator" to return these split location attributes or use them as inputs.
- Ensure the state pass from "Basic Information" to "Procedural Character Generator" includes name, gender, and origin location fields.
