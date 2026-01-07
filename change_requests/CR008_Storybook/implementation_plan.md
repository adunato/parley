# Storybook Implementation Plan

## Goal
Establish a comprehensive Storybook design system for the Parley project, enabling isolated development and documentation of UI components.

## User Review Required
None. This is a task to improve developer experience and documentation.

## Proposed Changes

### Storybook Configuration
- [x] Verify `.storybook/preview.ts` loads global styles.
- [ ] Ensure `tailwind.config.js` content paths include storybook files (usually not needed if just using classes, but good to check).

### Component Stories
I will create `.stories.tsx` files for the following components in `src/components/ui`:

#### Primitives
- [ ] `button.stories.tsx`: Variants (default, destructive, outline, secondary, ghost, link), Sizes (default, sm, lg, icon).
- [ ] `card.stories.tsx`: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
- [ ] `input.stories.tsx`: Default, File, Disabled.
- [ ] `textarea.stories.tsx`: Default, Disabled.
- [ ] `label.stories.tsx`: Default.
- [ ] `badge.stories.tsx`: Default, Secondary, Destructive, Outline.

#### Layout & Interactive
- [ ] `tabs.stories.tsx`: Example usage.
- [ ] `accordion.stories.tsx`: Single and Multiple examples.
- [ ] `scroll-area.stories.tsx`: Example with content.

#### Form Elements
- [ ] `select.stories.tsx`: Example usage.
- [ ] `radio-group.stories.tsx`: Example usage.
- [ ] `combobox.stories.tsx` (if present): Example usage.
- [ ] `checkbox.stories.tsx` (if present): Example usage.

#### Overlays (Mocked/Interactive)
- [ ] `dialog.stories.tsx`: Open dialog example.
- [ ] `popover.stories.tsx`: Example usage.
- [ ] `tooltip.stories.tsx`: Example usage.

### Complex Components (If time permits)
- [ ] `ChatComponent` story (mocked props).

## Verification Plan
1.  Run `npm run storybook`.
2.  Manually verify each story renders correctly in the browser.
