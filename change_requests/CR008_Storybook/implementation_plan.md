# Custom Themes Implementation Plan

## Goal
Add user-requested `demiplane_light` and `demiplane_dark` themes, customizing **ALL UI ASPECTS** (colors, fonts, shapes, borders).

## Palette Definition

### Structure
-   **Radius**: `--radius`
    -   Default: `0.5rem` (Rounded)
    -   Demiplane: `0rem` (Sharp/Square)
-   **Border Width**: `--border-width`
    -   Default: `1px`
    -   Demiplane: `2px` (Thicker, more physical)
-   **Fonts**:
    -   Default: `Inter` (Sans-serif)
    -   Demiplane: `Cinzel` (Serif/Fantasy) -> *Will add Google Font*

### Colours (Updated)

#### Demiplane Light (Parchment)
-   **Background**: `hsl(35 30% 96%)`
-   **Foreground**: `hsl(240 10% 10%)` (Ink)
-   **Primary**: `hsl(160 50% 30%)` (Deep Emerald Green)
-   **Secondary**: `hsl(35 20% 90%)`
-   **Accent**: `hsl(35 40% 85%)`
-   **Border**: `hsl(30 20% 70%)` (Darker parchment edge)
-   **Radius**: `0rem` (Sharp)

#### Demiplane Dark (Void)
-   **Background**: `hsl(260 20% 10%)` (Deep Purple Black)
-   **Foreground**: `hsl(260 10% 90%)` (Pale Lavender)
-   **Primary**: `hsl(270 50% 60%)` (Amethyst)
-   **Secondary**: `hsl(260 20% 15%)`
-   **Accent**: `hsl(260 30% 20%)`
-   **Border**: `hsl(260 30% 30%)`
-   **Radius**: `0.25rem` (Slightly rounded)

## Proposed Changes

### Fonts
- [ ] **`src/app/layout.tsx`**: Import `Cinzel` and `Cinzel_Decorative` from `next/font/google` and add them to the body class list via CSS variables (e.g., `--font-cinzel`).
- [ ] **`tailwind.config.js`**: Extend theme fontFamily to include `fantasy: ["var(--font-cinzel)", "serif"]`.

### CSS
- [ ] **`src/app/globals.css`**: 
    -   Refactor to use `--font-primary` variable.
    -   Add `--border-width` variable mapping.
    -   Implement the `.demiplane-light` and `.demiplane-dark` classes with comprehensive overrides (colors + radius + fonts + border widths).

### Storybook
- [ ] **`.storybook/preview.tsx`**: Ensure the decorator applies the correct font and theme classes.

## Verification
-   Run `npm run storybook`.
-   Verify buttons become sharp and serif-fonted when switching to Demiplane.
