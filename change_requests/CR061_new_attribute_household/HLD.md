# New attribute "Household"

## Status
Draft

## Goals
- Characters can be assigned to "households".
- A household will comprise a series of people and a residential location.
- Modify the character selection flow so that the player selects the household first, and then the character.

## Proposed Solution
- **Data Model:** Create a new `Household` interface/type and establish the relationship between characters and households.
- **State Management:** Introduce a new slice or update the existing game state to manage households and their locations.
- **UI Updates:** 
  - Create a new configuration view for assigning characters to households.
  - Update the character selection screen at the start of the game to first display a list of households.
  - Selecting a household should reveal the characters residing within it for final selection.
