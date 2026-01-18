# Consistent Page Structure in Configuration Pages

## Status
Draft

## Goals
- Standardize the layout structure across all configuration pages.
- Ensure consistent horizontal alignment and content width (increasing max-width to at least 1600px or 1920px).
- Maintain the navigation pane on the left.
- Center the main content area.

## Proposed Solution
1.  **Identify Configuration Pages:**
    - `src/app/settings/page.tsx`
    - `src/app/character-config/page.tsx`
    - `src/app/character-group-config/page.tsx`
    - `src/app/persona-config/page.tsx`
    - `src/app/world-info/page.tsx`
    - `src/app/locations/page.tsx`
    - `src/app/bio-config/page.tsx`
2.  **Standardize Layout:**
    - Create or update a shared layout component (or apply consistent CSS classes) that enforces:
        - Flexbox/Grid layout with a fixed or responsive key sidebar.
        - Main content area that fills remaining space and centers its children.
        - A "container" for the actual content with `max-w-[1600px]` or `max-w-[1920px]` (or similar large breakpoint) and `mx-auto`.
3.  **Refactor Pages:**
    - Update each identified page to use this standardized structure.
