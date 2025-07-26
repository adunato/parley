# OBJECTIVE

Create a new entity for character groups.

# REQUIREMENTS

1. **Character Groups:** We will create a new entity called `CharacterGroup` that will represent a group of characters.
   This entity will have the following properties:
    * `id`: A unique identifier for the character group.
    * `name`: The name of the character group.
    * `characters`: An array of character IDs that belong to the character group.
    * characters can belong to more than one group
    * `description`: A description of the character group.

# DESIGN

## 1. Data Model

We will introduce a new type `CharacterGroup` in `src/lib/types.ts` with the following structure:

```typescript
export interface CharacterGroup extends BaseEntity {
  characters: string[];
  description: string;
}
```

## 2. Data Storage

We will extend the `EntityStore` in `src/lib/entityStore.ts` to manage `CharacterGroup` entities. This will involve updating the `EntityStore` to handle the loading and saving of character groups from and to the file system.

## 3. User Interface

A new page will be created at `src/app/character-group-config/page.tsx` to provide a user interface for managing character groups. This page will allow users to create, view, edit, and delete character groups.

The UI will be built using a new component, `CharacterGroupConfiguration`, which will be located in `src/components/character-group-configuration.tsx`. This component will provide a form for editing the properties of a character group, as well as a list of the characters of the group.

## 4. Navigation

A link to the new character group configuration page will be added to the main navigation menu to ensure that it is easily accessible to users.

## 5. Character Configuration UI

The character configuration page (`src/app/character-config/page.tsx`) will be updated to display a list of available character groups. Users will be able to add or remove the character from these groups. This will be implemented by updating the `CharacterConfiguration` component in `src/components/character-configuration.tsx`.

When a character is added to a group, the character's ID will be added to the `characters` array of the corresponding `CharacterGroup` entity. Similarly, when a character is removed from a group, their ID will be removed from the `characters` array.

# IMPLEMENTATION STEPS

1.  **Modify `src/lib/types.ts`:** Add the `CharacterGroup` interface.
2.  **Modify `src/lib/entityStore.ts`:** Add support for `CharacterGroup` entities to the `EntityStore`.
3.  **Create `src/app/character-group-config/page.tsx`:** Create the new page for managing character groups.
4.  **Create `src/components/character-group-configuration.tsx`:** Create the new component for the character group configuration page.
5.  **Update Navigation:** Add a link to the new page in the main navigation menu.
6.  **Update `game_design.md`:** Reflect the new character group functionality in the game design document.
7.  **Modify `src/app/character-config/page.tsx` and `src/components/character-configuration.tsx`:** Update the character configuration UI to allow users to manage a character's group memberships.