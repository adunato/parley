# OBJECTIVE

Distribute the game entities across store.ts and entityStore.ts.

# REQUIREMENTS

1. game state objects should stored in store.ts
2. game entities should be stored in entityStore.ts

# DESIGN

The core principle of this refactoring is to clearly delineate responsibilities between `store.ts` and `entityStore.ts`.

## `store.ts` - Game State Management

`store.ts` will be responsible for managing the global, singular state of the game. This includes:
*   **Current Game Progress:** Such as the current chapter, scene, or narrative branch.
*   **Player-specific Data:** Like inventory, player health, or current location (if not represented as an entity).
*   **UI State:** Any global UI state that affects the overall application, not specific components.
*   **Flags/Settings:** Global game settings or flags that influence gameplay or application behavior.

The data stored here should generally be unique and directly impact the flow or presentation of the game at a high level. It should not contain collections of similar objects.

## `entityStore.ts` - Game Entity Management

`entityStore.ts` will be dedicated to managing collections of game entities. Entities are distinct, manageable objects within the game world that can be created, updated, or deleted. Examples include:
*   **Characters:** NPCs, companions, or other interactive characters.
*   **Items:** Collectible or usable objects.
*   **Locations/Scenes:** If these are dynamic and managed as distinct objects rather than static game state.
*   **Relationships:** Between characters or entities.

Each type of entity will likely have its own dedicated Zustand store or a part of a larger entity store, allowing for efficient management, retrieval, and manipulation of these collections. This approach supports the "You Might Not Need an Effect" principle by allowing derived data related to entities (e.g., a character's full name from first and last names) to be computed directly from the entity data within `entityStore.ts` during render, rather than being stored as separate state in `store.ts`.

This separation ensures a cleaner architecture, improves maintainability, and makes it easier to reason about where different pieces of game data reside and how they are managed.

## Consumer Amendments

Components and other consumers of the store will need to adjust their imports and state access patterns. Instead of importing `useParleyStore` and accessing all state from a single source, consumers will now import from either `store.ts` or `entityStore.ts` based on the type of data they need.

This explicit separation at the import level will make it clearer which type of data a component is interacting with, reinforcing the architectural boundaries.

### Specific Consumer Amendments

Here's a breakdown of how each file currently using `useParleyStore` will need to be modified:

*   **`src/app/api/chat/route.ts`**
    *   **Current Usage:** `worldDescription`, `aiStyle`, `chatModel`
    *   **Change:** These are game state variables. The import will change from `useParleyStore` to `useStore` (or similar, from `store.ts`). The access pattern will remain similar, e.g., `const { worldDescription, aiStyle, chatModel } = useStore();`

*   **`src/app/chat/page.tsx`**
    *   **Current Usage:** `characters`, `playerPersonas`, `setSelectedChatCharacter`, `setSelectedChatPersona`, `selectedChatCharacter`, `selectedChatPersona`, `clearChat`, `_hasHydrated`, `chatSessionId`, `updateCharacter`, `cumulativeRelationshipDelta`, `updateCumulativeRelationshipDelta`, `clearCumulativeRelationshipDelta`, `chatMessages`, `worldDescription`, `aiStyle`, `chatModel`, `summarizationModel`, `generationModel`
    *   **Change:**
        *   **From `store.ts` (Game State):** `setSelectedChatCharacter`, `setSelectedChatPersona`, `selectedChatCharacter`, `selectedChatPersona`, `clearChat`, `_hasHydrated`, `chatSessionId`, `cumulativeRelationshipDelta`, `updateCumulativeRelationshipDelta`, `clearCumulativeRelationshipDelta`, `chatMessages`, `worldDescription`, `aiStyle`, `chatModel`, `summarizationModel`, `generationModel`.
        *   **From `entityStore.ts` (Game Entities):** `characters`, `playerPersonas`, `updateCharacter`.
        *   Imports will be split: `import { useStore } from '@/lib/store';` and `import { useEntityStore } from '@/lib/entityStore';`.
        *   Access patterns will reflect the split, e.g., `const { selectedChatCharacter, ... } = useStore();` and `const { characters, updateCharacter, ... } = useEntityStore();`

*   **`src/app/settings/page.tsx`**
    *   **Current Usage:** `chatModel`, `setChatModel`, `summarizationModel`, `setSummarizationModel`, `generationModel`, `setGenerationModel`
    *   **Change:** These are game state variables. The import will change from `useParleyStore` to `useStore` (or similar, from `store.ts`). The access pattern will remain similar.

*   **`src/app/world-info/page.tsx`**
    *   **Current Usage:** `worldDescription`, `setWorldDescription`, `aiStyle`, `setAiStyle`, `clearAllData`
    *   **Change:** These are game state variables. The import will change from `useParleyStore` to `useStore` (or similar, from `store.ts`). The access pattern will remain similar.

*   **`src/components/character-configuration.tsx`**
    *   **Current Usage:** `characters`, `addCharacter`, `updateCharacter`, `deleteCharacter`, `addPlayerPersona`, `worldDescription`, `aiStyle`, `_hasHydrated`, `playerPersonas`
    *   **Change:**
        *   **From `store.ts` (Game State):** `worldDescription`, `aiStyle`, `_hasHydrated`.
        *   **From `entityStore.ts` (Game Entities):** `characters`, `addCharacter`, `updateCharacter`, `deleteCharacter`, `addPlayerPersona`, `playerPersonas`.
        *   Imports will be split. Access patterns will reflect the split.

*   **`src/components/chat-component.tsx`**
    *   **Current Usage:** `selectedChatCharacter`, `selectedChatPersona`, `chatMessages`, `setChatMessages`, `chatInput`, `setChatInput`, `worldDescription`, `aiStyle`, `chatModel`
    *   **Change:** These are game state variables (or selected entities which are part of game state). The import will change from `useParleyStore` to `useStore` (or similar, from `store.ts`). The access pattern will remain similar.

*   **`src/components/persona-configuration.tsx`**
    *   **Current Usage:** `playerPersonas`, `addPlayerPersona`, `updatePlayerPersona`, `deletePlayerPersona`, `worldDescription`, `aiStyle`, `_hasHydrated`
    *   **Change:**
        *   **From `store.ts` (Game State):** `worldDescription`, `aiStyle`, `_hasHydrated`.
        *   **From `entityStore.ts` (Game Entities):** `playerPersonas`, `addPlayerPersona`, `updatePlayerPersona`, `deletePlayerPersona`.
        *   Imports will be split. Access patterns will reflect the split.

# IMPLEMENTATION

The implementation of this refactoring will involve several key steps:

1.  **Identify and Migrate Game State to `store.ts`:**
    *   Review existing state variables in `store.ts` and other relevant files.
    *   Consolidate all global game state (e.g., current chapter, player progress, UI settings) into `store.ts`.
    *   Ensure that state updates in `store.ts` are atomic and reflect the singular nature of game state.

2.  **Identify and Migrate Game Entities to `entityStore.ts`:**
    *   Identify all game entities (e.g., characters, items, relationships) currently managed in `store.ts` or elsewhere.
    *   For each entity type, create a dedicated section or sub-store within `entityStore.ts`.
    *   Implement CRUD (Create, Read, Update, Delete) operations for each entity type within `entityStore.ts`.
    *   Consider using a normalized state structure within `entityStore.ts` (e.g., an object where keys are entity IDs and values are entity objects) for efficient lookups and updates.

3.  **Update Consumers:**
    *   Modify all components and modules that previously accessed game state or entities to use the new `store.ts` and `entityStore.ts` accordingly.
    *   Ensure that data access patterns are consistent with the new store structure.

4.  **Define Clear Types:**
    *   Establish clear TypeScript interfaces and types for both game state in `store.ts` and each entity type in `entityStore.ts`.
    *   This will improve code clarity, maintainability, and enable better static analysis.

5.  **Refactor Data Derivation:**
    *   Where data was previously derived and stored in state using `useEffect`, refactor these to be computed directly during render or using `useMemo` within components, leveraging the raw data from `entityStore.ts`.
    *   This aligns with the "You Might Not Need an Effect" principle and reduces unnecessary re-renders.

6.  **Testing:**
    *   Write or update unit and integration tests to ensure the correct functioning of both `store.ts` and `entityStore.ts` and their interactions with components.

7.  **Documentation:**
    *   Update any relevant documentation (e.g., `game_design.md`, `README.md`) to reflect the new store architecture.