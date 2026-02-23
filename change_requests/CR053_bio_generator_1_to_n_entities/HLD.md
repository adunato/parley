# CR053: Bio Generator 1:n Entities

## Status
Draft

## Goals
- Allow a 1:n relationship between spine nodes in the bio-generator and game entities, instead of the current 1:1 mapping.
- Enable target mapped entities to be available for selection even if they are already mapped against another node.

## Proposed Solution
- Update the data model/store mapping logic to support an array of entities per node instead of a single entity.
- Modify the UI (e.g., node entity selection dropdowns/modals) to allow multiple selections or mapping multiple entities.
- Adjust the filtering logic that currently hides entities already mapped to other nodes so they remain selectable.
