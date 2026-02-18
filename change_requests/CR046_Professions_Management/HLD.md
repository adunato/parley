# CR046 Professions Management

## Status
Draft

## Goals
- Create a new entity `Profession`.
- Provide a configuration interface for Professions (CRUD).
- Replace the free-text "Role" field in Character Configuration with a dropdown selecting from defined Professions.

## Proposed Solution
1.  **Data Structure**: Define a `Profession` type (likely just an ID and Name/Description).
2.  **Store**: Update `BioStore` (or appropriate store) to manage a list of `Profession` entities.
3.  **UI - Config**: Create a new configuration tab "Professions" similar to other config pages.
4.  **UI - Character**: Update the Character Configuration page to use a dropdown for "Profession" instead of an input for "Role".
5.  **Serialization**: Ensure professions are saved/loaded with the rest of the configuration.
