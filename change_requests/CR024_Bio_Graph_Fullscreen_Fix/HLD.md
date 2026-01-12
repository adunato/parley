# CR024: Bio Graph Fullscreen Edit Fix

## Problem
When the Bio Configuration Graph view is in full-screen mode (using the browser's Fullscreen API), the "Edit Node" dialog is not visible. This is because the Dialog component uses a Portal to render its content at the end of `document.body`, which is outside the element currently being displayed in full-screen mode.

## Proposed Solution
We need to ensure that the Dialog content is rendered inside the full-screen element when full-screen mode is active.

### Changes

1.  **Update `src/components/ui/dialog.tsx`**:
    *   Modify `DialogContent` to accept an optional `container` prop.
    *   Pass this `container` prop to the `DialogPortal` component.

2.  **Update `src/components/bio-config/bio-entity-editor.tsx`**:
    *   Add an optional `container` prop to `BioEntityEditor`.
    *   Pass this `container` to the `DialogContent` component.

3.  **Update `src/components/bio-config/bio-graph-view.tsx`**:
    *   Pass the `graphContainerRef.current` as the `container` prop to `BioEntityEditor` when `isFullScreen` is true.

## Verification
1.  Navigate to Bio Configuration page.
2.  Enter full-screen mode.
3.  Click "Edit" on a node (or double click if that triggers it - strictly speaking it's the edit button/action).
4.  Verify the dialog appears and is functional.
5.  Exit full-screen mode.
6.  Verify the dialog still works normally.

## Verification Status
- [x] Code implemented.
- [x] Type check passed (`npx tsc --noEmit`).
- [ ] Manual verification (User to perform).

