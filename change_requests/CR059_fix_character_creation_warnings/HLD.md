# CR059: Fix Character Creation Console Warnings

## Goal

Fix three console warnings/errors appearing during character creation:

1. **`setState` during render** — `updateCharacter` (Zustand) is called inside a React `useState` updater callback in `generateCharacter`, which triggers a state update on a different component while rendering.
2. **Button inside button** — a `<Button>` element is nested inside `<AccordionTrigger>` (both render as `<button>`), causing a hydration warning.
3. **Relationship creation logging** — occasional failures produce a generic alert with no diagnostic detail; add server-side error propagation and client-side breadcrumb logs.

## Proposed Solution

### Fix 1: Remove Zustand call from React state updater (`character-configuration.tsx`)

In `generateCharacter`, replace the `setLocalCharacter(prev => { updateCharacter(updated); return updated; })` pattern with two sequential calls: compute `updated` from the closure-captured `localCharacter`, then call `updateCharacter(updated)` and `setLocalCharacter(updated)` directly. This is safe because the code runs inside an `async` function after `await fetch(...)`.

### Fix 2: Move delete button out of AccordionTrigger (`character-configuration.tsx`)

Wrap the `<AccordionTrigger>` and delete `<Button>` in a `<div className="flex items-center">` so they are siblings, not parent-child. The delete button retains its `e.stopPropagation()` handler.

### Fix 3: Add logging (`character-configuration.tsx`, `relationship/route.ts`)

- API route: include the original error message in the JSON error response.
- Client handler: log `response.status` and error body text on failure.
- `generateCharacter`: add `console.log` breadcrumbs at the start, inside the placeholder loop, and at the end of placeholder creation.

## Files Changed

- `src/components/character-configuration.tsx`
- `src/app/api/generate/relationship/route.ts`
