# High Level Design: Game State Management (CR011)

## 1. Problem Description

Currently, the application mixes "World Configuration" (editing characters, locations, personas) and "Game State" (active chat history, dynamic relationship changes) into a single persistence layer (`entityStore` and `parleyStore`).

This means:
1.  There is no way to "reset" a game without manually deleting characters/changes.
2.  Editing a character in the configuration immediately affects the ongoing "game" in a way that might break consistency (or conversely, game events might overwrite the "canonical" character description if we were to save back).
3.  "New Game" and "Continue" buttons are non-functional.

We want to separate:
-   **World Configuration**: The static definition of the world (Characters, Personas, Locations, Base Relationships). "Design Time".
-   **Game State**: The active instance of a game (History, Relationship Evolutions, Current Location). "Run Time".

## 2. Goals

1.  Enable "New Game": Instantiates a separate Game State from the current World Configuration.
2.  Enable "Continue": Resumes the existing Game State.
3.  Persist Game State separately from World Configuration in local storage.
4.  Does not yet require full "Save Slots" management (just one active game state for initial implementation), but should be architected to support it.

## 3. High-Level Architecture Changes

### 3.1. Store Separation

We will introduce a clear separation of concerns in the Zustand stores:

#### A. `WorldConfigStore` (Refactored `entityStore` + `projectStore`)
*   **Role**: Stores the "Source of Truth" for the World Design.
*   **Data**:
    *   Characters (Templates)
    *   Locations (Templates)
    *   Personas (Templates)
    *   World Description
*   **Persistence**: `parley-world-config` (Local Storage)
*   **UI Binding**: The `/character-config`, `/locations`, etc. pages will bind to THIS store.

#### B. `GameStateStore` (New)
*   **Role**: Stores the active runtime state of a game session.
*   **Data**:
    *   `isActive`: boolean (Is a game running?)
    *   `currentWorldConfig`: A snapshot or reference to the World Config version used to start the game.
    *   `characterStateDeltas`: Changes to characters (relationships, status effects).
    *   `chatHistory`: The message log.
    *   `currentLocation`: Where the player is.
    *   `currentDate`: In-game time.
*   **Persistence**: `parley-game-state` (Local Storage).
*   **UI Binding**: The `/chat` page and associated "Play" views will bind to THIS store (or a unified hook that merges Config + Game State).

### 3.2. "New Game" Workflow
1.  User clicks "New Game".
2.  System checks if a valid World Configuration exists.
3.  System creates a **Snapshot** of the current `WorldConfigStore`.
4.  `GameStateStore` is initialized:
    *   `sourceWorldId`: ID of the config.
    *   `characters`: Deep copy of characters from Config (to allow divergence).
    *   `relationships`: Initialized from Config.
    *   `chatHistory`: Empty.
5.  `gameInitialized` flag set to true.
6.  Navigate to `/chat` (or introductory scene).

### 3.3. "Continue" Workflow
1.  User clicks "Continue".
2.  System checks local storage for `parley-game-state`.
3.  If valid state exists, load it into `GameStateStore`.
4.  Navigate to `/chat`.

## 4. Detailed Design

### 4.1. Refactoring `entityStore`
Currently `entityStore` is effectively the `WorldConfigStore`. We will rename/alias it as the store used for *Configuration*.

However, for the *Active Game*, we need to access Characters.
Option:
-   **Dual-Use**: Components need to know if they are in "Edit Mode" or "Play Mode".
-   **Hook Abstraction**: `useGameAttributes()` vs `useEditorAttributes()`.

**Proposal**:
We will keep `entityStore` as the "Editor Store".
We will create `gameStore.ts`.

When the Game Component (`/chat`) renders:
-   It should pull data from `gameStore`.
-   If `gameStore` has a copy of characters, it uses those.

**Data Structure for GameStore**:
```typescript
interface GameState {
  id: string;
  startedAt: Date;
  lastPlayedAt: Date;
  
  // The snapshot of the world when the game started
  worldSnapshot: {
    characters: Character[];
    locations: Location[];
    personas: Persona[];
    worldDescription: string;
  };

  // Dynamic State
  activePersonaId: string;
  currentLocationId: string;
  
  // Runtime Deltas (or just mutable state for the game)
  // For V1, we might just mutate the snapshot directly in memory/storage
  // effectively "forking" the world.
}
```
**Decision**: For V1, "New Game" will simply **Deep Clone** the Entity Store data into the Game Store. The Game Store will be self-contained. The Chat UI will inspect `gameStore` for characters, not `entityStore`.

### 4.2. UI Updates
1.  `src/app/page.tsx` (Main Menu):
    -   Connect "New Game" to `useGameStore.startGame(worldData)`.
    -   Connect "Continue" to `useGameStore.resumeGame()`.
    -   "Continue" button disabled state based on `useGameStore.hasSaveGame`.

2.  `src/app/chat/page.tsx`:
    -   Switch data source from `useEntityStore` to `useGameStore`.
    -   *Correction*: To minimize refactoring risk, we can create a strictly typed `useGameplayContext` hook that abstracts whether we are reading from `entityStore` (if we wanted to test) or `gameStore`. But simpler is just to point the Chat UI to `gameStore`.

### 4.3. Data Migration
No migration needed for existing data, but we will treat current `entityStore` data as "Draft / Config" data.

## 5. Implementation Steps

1.  **Create `gameStore.ts`**:
    -   Define `GameState` interface.
    -   Implement `startNewGame(config: WorldConfig)`.
    -   Implement `loadGame()`.
    -   Include `characters`, `relationships`, etc. in `GameState`.

2.  **Define `WorldConfig` Interface**:
    -   Extract from `entityStore` types.

3.  **Update `src/app/page.tsx`**:
    -   Wire up buttons.

4.  **Update `src/app/chat/**`**:
    -   Refactor components to read from `gameStore` instead of `entityStore`.

## 6. Verification Plan

### Automated Tests
-   Unit test for `gameStore`:
    -   Start new game -> Verify data cloned.
    -   Modify game state -> Verify config state untouched.

### Manual Verification
1.  **Setup**: Go to Configuration, add a Character "Alice".
2.  **Action**: Main Menu -> New Game.
3.  **Action**: In Chat, verify "Alice" exists.
4.  **Action**: Chat with Alice (changing relationship).
5.  **Action**: Go back to Config. Change "Alice" name to "Alice (Copy)".
6.  **Action**: Go back to Game (Continue). Verify name is still "Alice" (Game State preserved).
7.  **Action**: "New Game" again. Verify "Alice (Copy)" is now the character (New snapshot taken).
