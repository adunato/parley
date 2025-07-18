# Refactor Character Personality into a Shared UI Component

**Objective:** To create a reusable, consistent UI component for displaying character personality traits (OCEAN scores), which will be used in both the character configuration and chat pages. The new component's visual style will be based on the existing `RelationshipDisplay` component.

## Current Implementation

-   **Character Configuration Page (`src/components/character-configuration.tsx`):** Personality traits are displayed and edited using simple `<Input>` fields for each of the five OCEAN scores (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism). This is functional but not visually engaging.
-   **Chat Page (`src/app/chat/page.tsx`):** A component named `<CharacterTraitsDisplay />` is used to show the character's personality, likes, and dislikes. The personality part is a simple list, which is inconsistent with how other data, like relationships, is presented.

## Proposed Solution

We will create a new shared component responsible for displaying character personality traits in a visually consistent and informative way.

### New Component: `CharacterPersonalityDisplay`

-   **File Location:** `src/components/character-personality-display.tsx`
-   **Purpose:** To display the five OCEAN personality traits of a character.
-   **Visual Style:** It will be modeled directly after the `RelationshipDisplay` component. Each trait will be represented by a horizontal bar, visually indicating the score (-100 to 100). This provides an at-a-glance understanding of the character's personality.
-   **Props:** The component will accept a `personality` object:
    ```typescript
    interface CharacterPersonalityDisplayProps {
      personality: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
      };
    }
    ```

### Reusable Sub-component: `PersonalityBar`

The `RelationshipBar` function within `relationship-display.tsx` will be extracted and generalized into its own component or utility so it can be used by both `RelationshipDisplay` and the new `CharacterPersonalityDisplay`. This will reduce code duplication.

## Implementation Steps

1.  **Create `src/components/character-personality-display.tsx`:**
    -   Implement the `CharacterPersonalityDisplay` component.
    -   It will be a `<Card>` containing a `CardHeader` and `CardContent`.
    -   Inside the content, it will map over the `personality` prop and render a `PersonalityBar` for each trait.

2.  **Refactor `chat/page.tsx`:**
    -   Remove the existing `<CharacterTraitsDisplay />` component.
    -   Add the new `<CharacterPersonalityDisplay />` component.
    -   Pass the `selectedChatCharacter.personality` object to the new component's props.

3.  **Refactor `character-configuration.tsx`:**
    -   In the detail view, locate the "Personality (OCEAN Traits)" card.
    -   When the form is **not** in edit mode (`isEditing` is false), render the new `<CharacterPersonalityDisplay />` component instead of the list of `<Input>` fields.
    -   When the form **is** in edit mode (`isEditing` is true), the existing `<Input>` fields will be shown to allow for editing.

4.  **Deprecate `character-traits-display.tsx`:**
    -   Once the new component is integrated into the chat page, the old `character-traits-display.tsx` component will no longer be needed.
    -   The file `src/components/character-traits-display.tsx` will be deleted to remove obsolete code.

## Benefits

-   **UI Consistency:** The personality display will match the relationship display, creating a more cohesive user experience.
-   **Code Reusability:** A single component will handle personality display across the application.
-   **Improved Readability:** The bar visualization is easier to interpret quickly than raw numbers or simple text lists.
-   **Maintainability:** Centralizing the component makes future updates easier.
