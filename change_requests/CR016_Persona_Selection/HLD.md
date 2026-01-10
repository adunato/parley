# HLD: Persona Selection at New Game

## 1. Goal
The goal is to introduce a "Persona Selection" step when starting a new game. Instead of automatically selecting the first available persona or forcing a selection later, the user will be presented with a visually rich selection screen featuring persona cards.

## 2. Requirements
- **Trigger**: "New Game" button on the Main Menu.
- **UI**: A new dialog or screen displaying a list of available personas.
- **Visuals**: 
    - Display as a series of cards.
    - Scrollable list (horizontal or vertical, depending on design - assuming horizontal carousel or grid).
    - Card content: Name, Avatar, Age, Role.
- **Logic**:
    - Upon selecting a persona, the game session starts.
    - The selected persona provides the context for the new game.
    - Transition to the World Map (existing flow) after selection.

## 3. Proposed Changes

### 3.1. New Route: `/new-game` (or Modal)
We have two options: a modal on the main menu or a dedicated page. Given the requirement for a "rich" card display, a dedicated page (intermediate step) or a full-screen overlay is preferred.
However, to keep it simple and responsive, we can replace the direct `startGame` call in `src/app/page.tsx` with a state change that opens a Persona Selection Dialog (Modal) over the main menu, OR route to a setup page. 
**Decision**: Use a **Dialog/Modal** on the Main Menu first. If it becomes too complex, we move to a page. A Dialog is consistent with "Configuration" usually, but "New Game" feeling like a wizard flow is also good.
Actually, the user said "Dialog".
> "Persona selection dialog"

So we will implement a Dialog loop.

### 3.2. Components
- **`PersonaSelectionDialog`**: A new component using `Dialog` from `ui/dialog`.
- **`PersonaCard`**: A new component to display the persona details.

### 3.3. State Management
- `src/app/page.tsx`:
    - Add state `isPersonaSelectionOpen`.
    - `handleNewGame` -> `setIsPersonaSelectionOpen(true)`.
    - Pass `handlePersonaSelected` to the dialog.

- `handlePersonaSelected(personaId)`:
    - Call `startGame` (from `gameStore`) with the chosen persona.
    - Route to `/world_map`.

### 3.4. Updates to `gameStore`
- Update `startGame` logic if necessary to accept a specific `currentPersonaId` instead of defaulting to `[0]`.
    - Current `startGame` takes `WorldConfigSnapshot`. We might want to pass an "options" object or just ensure the `currentPersonaId` logic prioritizes a passed ID.
    - **Refinement**: `startGame` accepts `config`. The `config` object has `playerPersonas`. It doesn't explicitly accept "initialState". 
    - **Action**: Modify `startGame` to accept an optional `initialPersonaId` argument.

## 4. Component Design

### 4.1. `PersonaCard`
- **Props**: `persona: Persona`, `onClick: () => void`, `isSelected: boolean`
- **Content**:
    - Avatar image (fallback to placeholder).
    - Name (Headline).
    - Role, Age (Subtext).
    - Styling: Card component, hover effects, border for selection.

### 4.2. `PersonaSelectionDialog`
- **Props**: `open: boolean`, `onOpenChange: (open: boolean) => void`, `personas: Persona[]`, `onSelect: (persona: Persona) => void`
- **Content**:
    - Header: "Select Your Persona".
    - Body: Scrollable area with mapped `PersonaCard`s.

## 5. Implementation Steps
1.  **Modify `gameStore`**: Update `startGame` to accept `initialPersonaId`.
2.  **Create `PersonaCard` component**.
3.  **Create `PersonaSelectionDialog` component**.
4.  **Update `src/app/page.tsx`**:
    - Import and implement `PersonaSelectionDialog`.
    - Update `handleNewGame` to trigger the dialog.
    - Implement callback to start game with selected persona.
