# Fix Bio Generator Graph Layout

## Status
Draft

## Goals
- Reduce the vertical space between nodes on the right side of the bio-generator graph (Event nodes).
- Clean up connection lines (reduce "river" effect).
- Align the right column more effectively with the left column to improve readability.

## Proposed Solution
- Modify `src/lib/generator/graph-utils.ts`.
- Investigate `dagre` layout configuration to see if `nodesep` or `ranksep` can be optimized.
- If global settings are insufficient, implement a post-processing step in `getLayoutedElements` to manually compact the positions of nodes in the right-most ranks (likely Life Events) after the initial Dagre layout.
- Adjust vertical spacing defaults if necessary.
