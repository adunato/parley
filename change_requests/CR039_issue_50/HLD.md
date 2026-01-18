# Issue #50

## Status
Draft

## Goals
- Address Issue #50: Improve TAG display and selection in bio-generator.
- Ensure the tag dropdown appears immediately upon clicking/focusing the tag edit field, even if empty.
- Allow selection of existing tags from the dropdown to populate the field.

## Proposed Solution
### `src/components/bio-config/tag-selector.tsx`
- Remove the `value.length > 0` condition from the `Popover` open property.
- This will enable the dropdown to display all available tags (fetched from `useBioStore`) as soon as the user focuses the input field, improving discoverability and ease of use.
