# High-Level Design: CR009 Main Menu & Sidebar Navigation

## 1. Overview
This CR transforms the application's navigation structure. The top toolbar will be replaced by a context-aware left sidebar. The entry point (`src/app/page.tsx`) will become a dedicated Main Menu. A new "Configuration Mode" concept is introduced, where the sidebar is visible, allowing access to settings and tools.

## 2. Requirements
- [ ] **Main Menu (Entry Point)**:
    - **New Game**: Starts the game loop (Placeholder logic for now).
    - **Continue**: Resumes previous game if exists (Placeholder logic).
    - **Configuration**: Enters "Configuration Mode".
- [ ] **Navigation Refactor**:
    - **Remove**: Top toolbar.
    - **Add**: Left Sidebar.
    - **Visibility**: Sidebar is **hidden** on Main Menu and Gameplay, **visible** ONLY in "Configuration Mode".
- [ ] **Sidebar Design**:
    - Vertical layout on the left.
    - Items: Icon + Text.
    - Content: Same links as the current toolbar (Settings, Character, Prompts, etc.).

## 3. User Flows
1.  **Launch**: User lands on **Main Menu**. Sidebar is hidden.
2.  **Select Configuration**: User clicks "Configuration".
3.  **Transition**: View changes to the default configuration page (likely "Settings" or "Character"). Sidebar appears.
4.  **Navigation**: User clicks sidebar items to switch between configuration screens.
5.  **Back**: (Implicit requirement) Need a way to return to Main Menu from Configuration Mode (e.g., a "Back" or "Home" button in the sidebar).

## 4. Architecture
### 4.1. Layout & State
-   `src/app/layout.tsx`: 
    -   Host the `Sidebar` component.
    -   Use a client-side hook or route check to determine visibility. 
    -   *Logic*: If path is `/` -> Hide. If path is `/chat` -> Hide. If path is `/settings`, `/character-config`, etc. -> Show.

### 4.2. Components
-   `src/components/layout/sidebar.tsx`: New component.
    -   Props: `activeRoute` (optional).
    -   Styling: Fixed width, full height, consistent "premium" dark theme.
-   `src/app/page.tsx`:
    -   Replaced with Main Menu UI.
    -   Clean, centered layout with the 3 primary buttons.

## 5. Implementation Steps
1.  **Sidebar Component**: Create `Sidebar` with existing navigation links.
2.  **Layout Update**: Modify `RootLayout` to include `Sidebar` and remove `Navbar/Toolbar`. Implement conditional rendering logic based on `usePathname`.
3.  **Main Menu Page**: specific design for `src/app/page.tsx` with the required buttons.
4.  **Routing**: Ensure "Configuration" button routes to the first available config page (e.g., `/settings` or `/character-config`).
