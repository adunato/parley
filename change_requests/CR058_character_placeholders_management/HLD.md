# Title: Character Placeholders Management
## Status: Draft

## Goals
- Tag characters created during the main character generation process as placeholders.
- Allow manual toggling of the placeholder status from the character configuration page.
- Add a checkbox to the characters list page to show/hide character placeholders.

## Proposed Solution
- **Data Model update:** Add an `isPlaceholder?: boolean` field to the `Persona` or `Character` data types / interface.
- **Generator update:** Update the procedural character generation so that newly generated related characters (like family members or relationships created automatically) are assigned `isPlaceholder: true`.
- **UI update - Character List:** Add a "Show placeholders" checkbox to the character list page (e.g., `src/app/character-config/page.tsx` or related list component), which filters out characters with `isPlaceholder: true` when unchecked.
- **UI update - Character Editor:** Add a switch/toggle for `isPlaceholder` inside the character configuration page (e.g. `src/components/character-config/CharacterConfiguration.tsx` or similar form) to allow manual override.
