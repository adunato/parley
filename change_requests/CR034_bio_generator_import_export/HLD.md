# Bio Generator Import/Export World

## Status
Draft

## Goals
- Allow users to export the current state of the Bio Generator world (nodes, edges, tags) to a JSON file.
- Allow users to import a previously exported Bio Generator world from a JSON file.
- Allow users to export the current Bio Generator settings to a JSON file.
- Allow users to import Bio Generator settings from a JSON file.
- Expose Import/Export functionalities via buttons in the Settings tab.

## Proposed Solution
- **Frontend**:
    - Add "Export World" and "Import World" buttons to the Settings tab in `BioEntityEditor` or related component.
    - Add "Export Settings" and "Import Settings" buttons to the Settings tab.
    - Implement file handling logic (trigger download for export, file picker for import).
- **Logic**:
    - **Export World**: Serialize the current `BIO` graph (nodes, edges) and `tags` from the store/state to a JSON object.
    - **Import World**: Parse the uploaded JSON, validate the structure, and replace the current store/state with the imported data.
    - **Export Settings**: Serialize the current generator settings.
    - **Import Settings**: Parse and update the generator settings.
