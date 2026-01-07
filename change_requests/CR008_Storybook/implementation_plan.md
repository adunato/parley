# Storybook Dark Mode Implementation Plan

## Goal
Enable toggling between Light and Dark modes in Storybook to match the project's theming capabilities.

## Proposed Changes

### Configuration Updates
- [ ] **`tailwind.config.js`**: Add `darkMode: ["class"]` to enable class-based dark mode logic in Tailwind.

### Storybook Preview Updates
- [ ] **`.storybook/preview.ts`**:
    -   Define a `globalType` named `theme` to add a toolbar switcher (Light/Dark).
    -   Add a `decorator` function that:
        1.  Reads the current `theme` from globals.
        2.  Adds/Removes the `dark` class on the `document.documentElement` (<html> tag).
        3.  Returns the story component.

## Verification
-   Run `npm run storybook`.
-   Use the new toolbar icon to switch between Light and Dark.
-   Verify components (like Card or Button) change colors according to `globals.css` variables.
