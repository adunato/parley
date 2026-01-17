# Feat: Bio-generator - Prune non-connected TAGS

## Status
Draft

## Goals
- Add a "Prune Unused Tags" button to the TAGS tab action toolbar.
- The button will erase all tags that have no connections (input or output) with any nodes.

## Proposed Solution
- Add a new action `pruneUnusedTags` to the `bioStore`.
- This action will iterate through `tags` and remove those that are not present in any `edges`.
- Update the UI to include the "Prune Unused Tags" button in the toolbar for the TAGS tab.
- Wire the button to the store action.
