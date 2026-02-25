# CR057: Replace Persona with Character Impersonation

## Status
Draft

## Goals
- Completely remove the concept of "Persona" from the application.
- Implement "Character Impersonation", allowing the player to select any existing `Character` from the world to play as at the start of a game session.
- Ensure all game logic, engine systems, and prompts treat the player as a fully-fledged `Character`.

## Proposed Solution

Based on a deep impact assessment, the following areas will be modified:

### 1. Types & Interfaces
- **`src/lib/types.ts`**:
  - `DELETE` the `Persona` interface entirely.

### 2. State Management
- **`src/lib/entityStore.ts` (World Config)**:
  - `DELETE` all Persona-related states (`playerPersonas`, `selectedChatPersona`) and actions (`addPlayerPersona`, `updatePlayerPersona`, `deletePlayerPersona`, `setSelectedChatPersona`).
  - Drop Persona hydration logic.
- **`src/lib/store/gameStore.ts` (Game Session)**:
  - `DELETE` `playerPersonas` and `currentPersonaId`.
  - `ADD` `currentPlayerCharacterId: string | null` to track which character the player is impersonating.
  - Update `startGame(config, initialPlayerCharacterId)` to accept a character ID instead of a persona ID.

### 3. UI Components & Pages
- **`src/app/persona-config/page.tsx`**: `DELETE` this page.
- **`src/components/persona-configuration.tsx`**, **`src/components/persona-card.tsx`**: `DELETE` these components.
- **`src/components/layout/sidebar.tsx`**: `MODIFY` to remove the navigation link to the Persona Configuration page.
- **`src/app/page.tsx` (Main Menu)**: `MODIFY` the "New Game" flow to skip persona selection if applicable, or point to character selection.
- **`src/components/persona-selection-dialog.tsx`**: 
  - `RENAME` to `character-selection-dialog.tsx`.
  - `MODIFY` to present the player with a list of `Character`s from the `EntityStore`, allowing them to select one to impersonate for the game session.
- **`src/app/chat/page.tsx` & `src/components/chat-component.tsx`**: `MODIFY` to retrieve and pass the player's selected `Character` to the chat APIs and UI instead of `Persona`.
- **`src/components/character/CharacterCard.tsx`** & others: `MODIFY` to handle any edge cases where the character being viewed might be the player themselves.

### 4. Engine, Prompts & APIs
- **`src/lib/engine/` (`analyst.ts`, `rules.ts`, `director.ts`)**: `MODIFY` references to `persona` to use the full `Character` profile of the player. The player character should have relationships, traits, and background available to the engine.
- **`src/lib/prompts/` (`chatPrompts.ts`, etc.)**: `MODIFY` to format the context using the new player `Character` data rather than `Persona` `BasicInfo`.
- **`src/app/api/generate/persona/route.ts`**: `DELETE` unused route.
- **Other APIs (`chat/route.ts`, process-scene, etc.)**: `MODIFY` to extract the `actor` (player) as a `Character` from the `GameStore` logic or request payload.

### 5. Verification Plan
- **Automated/Build Tests**: Run `npm run build` to ensure no TypeScript compilation errors remain after removing the `Persona` type. All type usages must be migrated.
- **Manual Verification**:
  1. Open the application. Note that "Persona Configuration" is no longer in the sidebar.
  2. Start a New Game. Verify the dialogue correctly requests selection of a *Character* rather than a Persona.
  3. Enter a chat session with an NPC. Verify that the LLM recognizes the player as their chosen Character (by name, background, traits) correctly.
  4. Test saving/resuming the game to ensure the chosen `currentPlayerCharacterId` is maintained across reloads.
