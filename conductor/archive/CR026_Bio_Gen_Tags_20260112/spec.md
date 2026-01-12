# Specification: Bio Generator Configuration - Tags Management

## 1. Overview
This track introduces a dedicated "Tags" management tab within the Bio Generator Configuration UI (`/bio-config`). This allows designers to view and manage the lifecycle of Tags, which serve as the "memory" of the procedural generation engine.

## 2. Functional Requirements

### 2.1 Tags Tab
- Add a new tab "Tags" to the `BioConfig` page.
- The tab will feature a table consistent with the style of "Origins", "Careers", and "Education".

### 2.2 Tags Table Columns
- **ID:** The unique string identifier for the tag (e.g., `RICH`, `STREET_SMART`).
- **Provided by:** A list of entities (Origins, Education, Careers, Life Events) that grant this tag upon selection.
- **Required by:** A list of entities that require this tag as a prerequisite.
- **Influences:** A list of entities whose selection weight is modified by this tag.
    - **Format:** `EntityID:weight` (e.g., `WHITE_COLLAR_CRIME:10`).

### 2.3 Tag Lifecycle (CRUD)
- **Edit:** Open a dialog to modify the Tag. Renaming a Tag ID should ideally update all references in the store (cascading update).
- **Duplicate:** Create a new tag based on an existing one.
- **Delete:** Remove a tag. The UI should warn if the tag is currently referenced by other entities.

### 2.4 Data Source & Storage
- Investigate and confirm if `src/lib/generator/data/*.json` files are legacy.
- Ensure "Tags" are stored and persisted in the same way as other bio-config entities (Zustand + Dexie).

## 3. Implementation Details

### 3.1 Components
- Update `BioDatasetEditor` or create a variant for the Tags view.
- Update the main Bio Config layout to include the "Tags" tab.

### 3.2 Data Logic
- Implement reverse-lookup logic to populate the "Provided by", "Required by", and "Influences" columns.

## 4. Acceptance Criteria
- A "Tags" tab is visible and functional in the Bio Config UI.
- The table correctly displays where each tag is provided, required, and its weight influences.
- Tags can be created, edited, duplicated, and deleted.
- Data persistence is consistent with existing entities.
