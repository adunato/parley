# New attribute "Household"

## Status
Draft

## Goals
- Characters can be assigned to "households".
- A household will comprise a series of people and a residential location.
- Replace the current "Character Groups" entity/concept with "Households", maintaining a similar configuration UI with appropriate modifications.
- Modify the character selection flow so that the player selects the household first, and then the character.
- Relationship Entity enhancements: Add a new parameter `liveTogether: boolean` to relationships (alongside `count` and `shareLastName`) to determine if the relationship implies belonging to the same household.
- Character Creation Rules:
  - If a character is not already in a relationship with someone, they should form their own household.
  - Placeholder characters should be assigned to the main character's household if the relationship specifies `liveTogether: true`.

## Proposed Solution
- **Data Model:** 
  - Replace `CharacterGroup` with `Household`.
  - Update the relationship configuration type to include `liveTogether`.
  - Ensure the placeholder character generation logic reads `liveTogether` and assigns the household ID accordingly.
- **State Management / Data Layer:** 
  - Update stores handling groups to handle households instead.
- **UI Updates:** 
  - Refactor the existing Character Groups configuration UI to serve as the Household configuration UI.
  - Update the character selection screen at the start of the game to first display a list of households, then revealing the characters residing within the selected household.
