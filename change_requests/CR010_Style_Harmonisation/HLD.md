# CR010 Style Harmonisation HLD

## 1. Overview
This Change Request aims to harmonise the visual style of the Parley application, bringing all pages and components in line with the reference design established in `src/stories/CharacterProfile.stories.tsx`. This includes updating the sidebar, settings, configuration pages, and chat interface to use a consistent color palette, typography, and component library.

## 2. Reference Style & Tokens
The reference style will be centralized in `globals.css` using CSS variables. We will **reject** hard-coded hex values in components.

### 2.1 Color Token Updates (`globals.css`)
-   **Primary Brand Color:** The `#336699` blue used in the reference will be defined as the **Primary** color.
    -   Value: `hsl(210 50% 40%)`
-   **Typography:**
    -   `font-display`: Already mapped to `Oswald`.
    -   `font-sans`: Already mapped to `Inter` (via `var(--font-primary)`).

## 3. Component-Level Action List

### 3.1 Global Navigation (`src/components/layout/sidebar.tsx`)
-   **Current:** Dark theme (`bg-gray-900`), `font-cinzel`.
-   **Action:**
    -   [ ] Change background to `bg-background` (or `bg-card`) with a right border `border-border`.
    -   [ ] Update "PARLEY" header to use `text-primary` and `font-display`.
    -   [ ] Update links to use `text-muted-foreground`, `hover:text-foreground`, `hover:bg-accent`.
    -   [ ] Active state: `bg-primary/10`, `text-primary`, `border-r-2 border-primary`.

### 3.2 Main Menu (`src/app/page.tsx`)
-   **Current:** Dark "Cinematic" theme.
-   **Action:**
    -   [ ] Retain the "Cover Page" feel but update Buttons to remove hard-coded grays.
    -   [ ] Use `bg-primary` for the main call-to-action button.
    -   [ ] Use `font-display` for headers.

### 3.3 Character Configuration (`src/components/character-configuration.tsx`)
-   **Current:** Standard/Default Shadcn styling.
-   **Action:**
    -   [ ] **Master List (Left):**
        -   Background: `bg-background` (or `bg-secondary/20` for contrast).
        -   Selection: `bg-primary/5` with `border-l-2 border-primary`.
        -   Text: `text-primary` for selected item name.
    -   [ ] **Detail View (Right):**
        -   Background: `bg-background`.
        -   Header Background: `bg-muted/30` (instead of `#f3f4f6`).
        -   Refactor Header to match `CharacterProfile` header (Avatar layout, Name typography).
        -   Replace generic `CardTitle` with `SectionHeader` component for "Basic Information", "Personality", etc.
        -   Update Input labels to match the "Uppercase, Bold, Tiny" style (`text-muted-foreground`, `text-xs`, `font-bold`, `tracking-wider`).

### 3.4 Chat Interface (`src/components/chat-component.tsx` & `src/app/chat/page.tsx`)
-   **Current:** Functional `Card` based layout.
-   **Action:**
    -   [ ] **Page Layout:** background `bg-muted/30`.
    -   [ ] **Chat Component:**
        -   Style the container `Card` to match `CharacterProfile` cards (shadow-sm, `border-border`).
        -   Update Message Bubbles:
            -   User: `bg-primary` text-white (ensure `primary-foreground` is readable).
            -   Assistant: `bg-card` (with border).
    -   [ ] **Relationship Display (`src/components/relationship-display.tsx`):**
        -   Refactor to match the "Relationship Snapshot" style in `CharacterProfile`.
    -   [ ] **Traits Display (`src/components/character-traits-display.tsx`):**
        -   Align with `ScoredStatGroup` style.

### 3.5 Settings (`src/components/settings/SettingsTabs.tsx`)
-   **Current:** Default Tabs.
-   **Action:**
    -   [ ] Update `TabsList` and `TabsTrigger` to match the custom tab style in `CharacterProfile` (Underline, Uppercase).

## 4. Shared Components
-   **Action:** Ensure `SectionHeader`, `ScoredStatCard`, etc., use `text-muted-foreground`, `bg-card`, etc., and no hard-coded colors.
