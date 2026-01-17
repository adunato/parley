# Bio Generator - Graph Layout Configuration

## Status
Draft

## Goals
- Allow configuration of horizontal spacing between nodes in the bio-generator settings.
- Allow configuration of vertical spacing between nodes in the bio-generator settings.
- Allow configuration of tag position along the edge path (percentage based).

## Proposed Solution
- Update `BioGeneratorSettings` interface and store to include:
  - `graphHorizontalSpacing` (number)
  - `graphVerticalSpacing` (number)
  - `edgeLabelPosition` (number, 0-1 or 0-100)
- Update the Settings UI in `BioGeneratorDialog` to include sliders/inputs for these new settings.
- Pass these settings to the Dagre layout engine or React Flow renderer.
  - Update layout calculation to use the dynamic spacing values.
  - Update custom edge component to position the label based on the percentage setting.
