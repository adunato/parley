# Character Profile Reconstruction Plan

## Goal
Recreate the specific layout from `uploaded_image_1767798294780.png` (Alex Chen profile).

## Visual Analysis
-   **Style**: Clean, white/grey modern RPG sheet (resembling Chronicles of Darkness/Vampire 5e).
-   **Header**: 
    -   Avatar (Round) + Name + Hamburger Menu.
    -   Right: Bane/Compulsion labels, "PERFORM ACTION" (Blue Button), Experience Counter.
-   **Attributes**: 
    -   3 Columns (Physical, Social, Mental).
    -   5-segment progress bars (Checks/Dots) for stats like Strength, Dexterity, etc.
-   **Skills**: 
    -   3 Columns.
    -   Simple list format.
-   **Personality (OCEAN)**:
    -   5-segment progress bars.
-   **Bottom Section**:
    -   Tabs: Relationships (PRQC), Traits & Tags, Social Network, Biography, Inventory, Notes.
    -   **Biography Tab**: Split view (Text Bio vs Relationship Snapshot).

## Implementation Steps
1.  **`src/stories/CharacterProfile.stories.tsx`**: Completely rewrite.
    -   **Helper Component**: `StatRow({ label, value, max })` - Renders the label and the block-based progress bar (blue filled blocks, empty outline blocks).
    -   **Layout**: Use CSS Grid for the 3-column Attributes and Skills sections.
    -   **Components**: Use `Card` for containers, `Tabs` for the bottom section, `Badge` or custom dives for the bars.

## New Mock Data
-   **Name**: Alex Chen.
-   **Attributes**: Standard WoD attributes (Int, Wits, Resolve, etc.).
-   **Skills**: Full list from image.
-   **OCEAN**: Specific values from image.
