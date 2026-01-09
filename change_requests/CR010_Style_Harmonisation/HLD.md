# CR010 Style Harmonisation HLD

## 1. Overview
This Change Request aims to harmonise the visual style of the Parley application, bringing all pages and components in line with the new design system. The target state is visually documented in `src/stories/DesignSystem.stories.tsx` (to be updated), which serves as the source of truth for all UI elements.

## 2. Design System Specification

### 2.1 Color Palette
The application uses a semantic color system defined in `globals.css` via CSS variables. All new development MUST use these semantic tokens, not raw hex values.

| Token | Variable | Description |
| :--- | :--- | :--- |
| **Primary** | `--primary` | Main brand color (`hsl(210 50% 40%)` Blue). Used for headers, primary actions, active states. |
| **Secondary** | `--secondary` | Less prominent elements (`hsl(210 40% 96.1%)`). formatting. |
| **Background** | `--background` | Page background (`hsl(0 0% 100%)` / Dark: `hsl(222.2 84% 4.9%)`). |
| **Foreground** | `--foreground` | Main text color. |
| **Muted** | `--muted` | Subdued backgrounds. |
| **Muted FG** | `--muted-foreground` | Subdued text (`hsl(215.4 16.3% 46.9%)`). |
| **Border** | `--border` | Default border color. |
| **Destructive** | `--destructive` | Error states and destructive actions. |

### 2.2 Typography
Fonts are managed via Tailwind utility classes mapped to CSS variables.

| Role | Class | Font Family | Usage |
| :--- | :--- | :--- | :--- |
| **Body** | `font-sans` | `Inter` (via `var(--font-primary)`) | Default text, inputs, long-form content. |
| **Display** | `font-display` | `Oswald` | Headers (`h1`-`h3`), statistics, decorative labels. |

**Typography Rules:**
-   **Section Headers:** Use `font-display`, Uppercase, tracking-wide.
-   **Labels:** `text-xs`, `font-bold`, `uppercase`, `tracking-wider`, `text-muted-foreground`.
-   **Body Text:** `text-sm` or `text-base` for readability.

### 2.3 UI Component Library
All components are located in `src/components/ui`. Developers must strictly use these components instead of building custom UI elements.

#### Generic Components
-   **Layout:** `Card`, `ScrollArea`, `Tabs`, `Accordion`, `SectionHeader`.
-   **Inputs:** `Button`, `Input`, `Textarea`, `Select`, `Checkbox` (if avail), `RadioGroup`, `Combobox`, `Command`.
-   **Feedback:** `Badge`, `Dialog`, `Popover`, `Tooltip`.
-   **Display:** `Avatar`, `Label`.

#### Domain-Specific Components
-   **`GameTimeDisplay`**: Shows in-game time/date.
-   **`ScoredStatCard`**: Display a single attribute/stat with a 1-5 dot rating.
-   **`ScoredStatGroup`**: Grouping wrapper for multiple `ScoredStatCard`s.
-   **`SkillList`**: List of skills with values.
-   **`SkillGroup`**: Grouping wrapper for `SkillList`s.
-   **`StatBox`**: Simple box for numerical stats (like XP).

## 3. Required Changes (Work Plan)

This section details the specific code changes required to bring the application into compliance with the Design System.

### 3.1 Global & Configuration
-   **Tailwind Config:** Ensure `font-display` and `font-sans` correctly map to the variables in `globals.css`.
-   **Globals.css:** Verify the `primary` color is updated to the new Blue (`hsl(210 50% 40%)`) and `radius` is set to `0.5rem` (or desired value).

### 3.2 Layout Refactors
#### [Sidebar](file:///c%3A/Users/danie/projects/parley/src/components/layout/sidebar.tsx)
-   **Background:** Change from `bg-gray-900` to `bg-background` or `bg-card` with `border-r`.
-   **Typography:** Update "PARLEY" logo to `text-primary`, `font-display`.
-   **Links:**
    -   Inactive: `text-muted-foreground`, `hover:text-foreground`, `hover:bg-accent`.
    -   Active: `bg-primary/10`, `text-primary`, `border-r-2 border-primary`.

### 3.3 Page Harmonisation

#### [Main Menu / Landing](file:///c%3A/Users/danie/projects/parley/src/app/page.tsx)
-   **Actions:** Update all buttons to use `Button` component with correct variants (`default`, `secondary`, `outline`). Remove hardcoded hex styles.
-   **Typography:** Ensure headers use `font-display`.

#### [Character Configuration](file:///c%3A/Users/danie/projects/parley/src/components/character-configuration.tsx)
-   **Master List:**
    -   Use `bg-muted/10` or `bg-background` for the list container.
    -   Selected item: `bg-primary/5`, `border-l-2 border-primary`.
-   **Detail View:**
    -   **Header:** Refactor to match `CharacterProfile` header style (Avatar + Name + Meta).
    -   **Sections:** Replace `CardTitle` with `SectionHeader`.
    -   **Inputs:** Update all labels to match "Uppercase, Bold, Tiny" style.

#### [Chat Interface](file:///c%3A/Users/danie/projects/parley/src/app/chat/page.tsx)
-   **Container:** `bg-muted/30` page background.
-   **Chat Window:**
    -   Wrapper: `Card` with `shadow-sm`.
    -   **Bubbles:**
        -   User: `bg-primary` text `primary-foreground`.
        -   AI: `bg-card` border `border-border`.
-   **Side Panel:**
    -   **Relationship:** Refactor to use `ScoredStatCard` or similar "Relationship Snapshot" style.
    -   **Traits:** Use `ScoredStatGroup` style.

#### [Settings](file:///c%3A/Users/danie/projects/parley/src/components/settings/SettingsTabs.tsx)
-   **Tabs:** Update `TabsTrigger` to use the "Underline & Uppercase" style seen in `CharacterProfile`.

#### [Locations](file:///c%3A/Users/danie/projects/parley/src/components/location-manager/location-manager.tsx)
-   **Cards:** Ensure location cards use the standard `Card` component.
-   **Headers:** Update to `font-display`.

### 3.4 Component Clean-up
-   **Audit:** Search codebase for `bg-[#...]` and `text-[#...]` and replace with semantic tokens where possible.
