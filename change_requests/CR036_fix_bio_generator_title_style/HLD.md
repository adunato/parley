# Fix: bio-generator title style

## Status
Draft

## Goals
- Align the "Bio Generator Configuration" page title and layout style with other main pages (like Settings, Characters, World Info).
- Ensure consistent use of typography tokens (e.g., `type-h2`).
- Standardize container padding and max-width if applicable.

## Proposed Solution
- Modify `src/app/bio-config/page.tsx`:
    - Update the top-level container to match `SettingsPage` (or similar standard pages).
    - Replace the raw Tailwind classes `text-3xl font-bold` with the project's standard typography class `type-h2` (if applicable and available in globals).
    - ensure the header section spacing (`mb-8` vs `space-y-4`) matches the standard.
