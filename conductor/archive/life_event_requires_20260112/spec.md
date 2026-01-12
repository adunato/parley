# Track Specification: Optional "Requires" Field for Life Events

## Overview
Currently, `Origin`, `Education`, and `Career` entities (Spine entities) in the Bio Generator support a `requires` field, which allows them to be filtered based on the character's current tags. `LifeEvent` entities (Flesh entities) lack this field. This track will add an optional `requires` field to `LifeEvent` entities, update the generation logic to respect these requirements, and enhance the UI and LLM generator to support them.

## Functional Requirements
1.  **Schema Update**: Add an optional `requires` field of type `string[]` (array of Tag IDs) to the `LifeEvent` interface.
2.  **BioMachine Filtering**: Update the `BioMachine` logic to filter out `LifeEvent` candidates whose `requires` tags are not all present in the character's current state.
3.  **UI Support**: 
    -   Update the `BioEntityEditor` component to allow users to add/remove/edit requirements for Life Events.
    -   The UI should ideally use a multi-select or a list of tags for consistency with other entities.
4.  **Store Logic**: Update the `bioStore` cascading rename and delete logic to ensure that if a Tag ID is changed or deleted, the `requires` fields in `LifeEvent` entities are updated accordingly.
5.  **LLM Generation**:
    -   Update the Zod schema used by the LLM generator to include the `requires` field.
    -   Update the system prompt to instruct the LLM to occasionally generate logical requirements for new Life Events (e.g., "Graduation" might require a "Student" tag).

## Non-Functional Requirements
-   **Consistency**: The implementation should mirror how `requires` is handled for `Origin`, `Education`, and `Career` entities.
-   **Type Safety**: Ensure strict TypeScript and Zod validation across the store, generator, and UI.

## Acceptance Criteria
-   [ ] `LifeEvent` interface in `types.ts` includes `requires?: string[]`.
-   [ ] `BioMachine` correctly skips Life Events if their requirements are not met.
-   [ ] A user can add a requirement to a Life Event via the UI and save it.
-   [ ] If a tag is renamed in the Tag Editor, all Life Events requiring that tag are updated with the new ID.
-   [ ] The LLM-assisted Life Event generation can produce events with logical `requires` fields.

## Out of Scope
-   Complex logical operators (OR, NOT) for requirements (keeping it as AND/Every for now).
-   Visualizing the dependency graph for Life Events in the main graph view (though it should be editable in the side panel).
