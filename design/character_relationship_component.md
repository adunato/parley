# Refactor Character Relationship into a Shared UI Component

**Objective:** To refactor the Character Configuration page to use the existing `RelationshipDisplay` component, creating a consistent and visually rich UI for displaying relationship metrics across the application.

## Current Implementation

-   **Chat Page (`src/app/chat/page.tsx`):** This page already uses a well-designed component, `<RelationshipDisplay />` (`src/components/relationship-display.tsx`), to show the state of the relationship between the selected character and player persona. It includes visual bars for different metrics, descriptions, and chat summaries.
-   **Character Configuration Page (`src/components/character-configuration.tsx`):** This page displays a character's relationships in a rudimentary way. It lists each relationship and its attributes (closeness, respect, etc.) as simple, disabled `<Input>` fields. This is not visually informative and is inconsistent with the chat page. A "Delete" button is available for each relationship when in edit mode.

## Proposed Solution

We will leverage the existing `RelationshipDisplay` component and integrate it into the Character Configuration page. Since `RelationshipDisplay` is a well-structured, presentation-focused component, it is perfect for reuse. The existing delete functionality will be retained.

### Implementation Steps

1.  **Modify `src/components/character-configuration.tsx`:**
    -   Import the `RelationshipDisplay` component at the top of the file:
        ```typescript
        import RelationshipDisplay from "@/components/relationship-display";
        ```
    -   Locate the "Relationships" card where relationships are currently rendered.
    -   Replace the existing logic that maps over relationships and renders them in `<Input>` fields.
    -   For each relationship, create a container (e.g., a `div` with a border). Inside this container, add a header that includes the persona's name and the **Delete** button. Below this header, render the `<RelationshipDisplay />` component.
    -   The `handleDeleteRelationship` function will be preserved and connected to the new "Delete" button.
    -   The props required by `RelationshipDisplay` (`characterName`, `relationship`) will be passed from the character and relationship data being iterated over.

    **Example Code Snippet (Illustrative):**

    ```tsx
    // Inside the "Relationships" CardContent in character-configuration.tsx

    {displayCharacter && displayCharacter.relationships.length > 0 ? (
        displayCharacter.relationships.map((relationship) => {
            const persona = playerPersonas.find(p => p.alias === relationship.personaAlias);
            return (
                <div key={relationship.personaAlias} className="border p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Relationship with {persona?.name || relationship.personaAlias}</h4>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRelationship(displayCharacter.id, relationship.personaAlias)}
                            disabled={!isEditing}
                        >
                            Delete
                        </Button>
                    </div>
                    <RelationshipDisplay 
                        characterName={persona?.name || relationship.personaAlias} 
                        relationship={relationship} 
                    />
                </div>
            );
        })
    ) : (
        <p className="text-gray-500">No relationships exist yet.</p>
    )}
    ```

2.  **No Changes to `RelationshipDisplay`:**
    -   The `RelationshipDisplay` component itself requires no modifications, as it is already designed for this purpose.

3.  **Editing Behavior:**
    -   Relationships are not directly editable; they are an outcome of in-game chat interactions. The `RelationshipDisplay` component (which is read-only) is a perfect fit.
    -   The **Delete** button will be visible and enabled only when the character form is in edit mode (`isEditing` is true), preserving the existing interaction pattern.

## Benefits

-   **UI Consistency:** The view for relationships will be identical on both the chat and character configuration pages.
-   **Improved Visualization:** The rich, graphical display of relationship metrics will be available in the character configuration screen.
-   **Code Reusability & Maintainability:** Reusing an existing component reduces code duplication and centralizes the relationship view, making future updates easier.
-   **Preserved Functionality:** Critical actions like deleting a relationship are maintained within the new, improved UI structure.