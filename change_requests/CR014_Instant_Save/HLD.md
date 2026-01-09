# CR014: Instant Save Migration HLD

## 1. Goal
Remove the explicit "Edit" and "Save" workflow from all configuration pages in the application. Replace it with an "Instant Save" (or Auto-Save) mechanism where changes are persisted immediately (or after a short debounce) as the user interacts with the UI.

## 2. Scope
This change applies to all "Configuration" type pages where users edit data. Identified target areas include:
- **Character Configuration**: `src/app/character-config`
- **Locations**: `src/app/locations`
- **Settings**: `src/app/settings`
- **World Info**: `src/app/world-info`
- **Persona Config**: `src/app/persona-config`
- **Character Group Config**: `src/app/character-group-config`

## 3. Current State
Currently, pages often have an `isEditing` state.
- Users click "Edit" to unlock inputs.
- Users make changes.
- Users click "Save" to persist changes to the store/disk.
- If users navigate away without saving, changes might be lost (depending on specific implementation).

## 4. Proposed Design

### 4.1. Interaction Model
- **Always Editable**: Inputs are always enabled (unless read-only by logic other than "edit mode").
- **Reactive Updates**:
    - **Text Inputs**: Persist on `blur` or debounced `change` (e.g., 500ms delay).
    - **Select/Toggle/Radio**: Persist immediately on `change`.
    - **Complex Components (Lists, etc.)**: Persist immediately upon modification (add/remove/reorder).
- **Visual Feedback**:
    - Introduce a "Save Status" indicator (e.g., "Saving...", "All changes saved") in a consistent location (e.g., Top Right of the content area or near the header).
    - Optional: Dirty state indication for specific fields if needed, though usually not necessary for instant save.

### 4.2. Technical Implementation
- **State Management**: continue using Zustand stores.
- **Persistence**: Actions in the store should trigger persistence `onChange`.
    - *Note*: With the move to IndexedDB (CR013), persistence is asynchronous.
- **Debounce Logic**: Use a utility hook (e.g., `useDebounce` or `useDebouncedCallback`) for text fields to avoid excessive writes during typing.

### 4.3. Error Handling
- If a save fails, notify the user immediately (Toast or error banner).
- Allow retry.

## 5. Iterative Plan
We will migrate one page/section at a time ensuring stability.
1. **Pilot**: Pick one simple page (e.g., `Settings` or `Locations`) to implement and refine the pattern.
2. **Rollout**: Apply to complex pages (`Character Config`) once the pattern is proven.
3. **Cleanup**: Remove deprecated `isEditing` logic and old "Save" buttons from the codebase.
