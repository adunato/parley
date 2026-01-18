# Implementation Plan - CR039 (Issue #50)

## Overview
Improve tag selection in the bio-generator by ensuring the tag dropdown appears immediately when the tag input field is focused, regardless of whether it contains text.

## Proposed Changes

### 1. `src/components/bio-config/tag-selector.tsx`
- Modify the `open` prop of the `Popover` component.
- Remove the `value.length > 0` constraint.
- The new condition should be `open && filteredTags.length > 0`.
- This ensures that if there are tags available in the store, they are shown as soon as the user focuses the input or starts typing.

## Verification Plan

### Automated Tests
- I will check if there are existing tests for `TagSelector`.
- If not, I'll consider adding a basic test to verify the dropdown visibility logic.

### Manual Verification
1. Open the Bio-Generator configuration.
2. Focus on a tag input field (e.g., in a life event or group requirement).
3. Verify that the dropdown appears immediately showing all available tags.
4. Type a character and verify the list filters correctly.
5. Select a tag and verify it populates the field.
6. Verify the dropdown closes after selection or on blur.

## Rollback Plan
- Revert the changes to `src/components/bio-config/tag-selector.tsx` using git.
