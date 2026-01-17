# Bio Generator World Info Data Management

## Status
Draft

## Goals
- Enable "Save As", Rename, Delete, and Create New functionality for Bio Generator world datasets.
- Align the UI with `http://localhost:3000/world-info`.
- Incorporate Import/Export JSON functionality as part of the dataset management UI at the top of the settings page.
- Enable dataset selection within the "Procedural Character Generator" dialog.
- Ensure data updates across all bio-generator tabs upon dataset selection.

## Proposed Solution
- **UI Updates**:
    - Update bio-generator settings page to include new controls.
    - Modify "Procedural Character Generator" dialog.
- **State Management**:
    - Refactor `bioStore` or create new store for world data management.
    - Implement persistence (likely via existing storage mechanism or new request).
- **Logic**:
    - Implement logic for CRUD operations on world datasets.
