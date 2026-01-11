# HLD: CR021 - Bio Generator Configuration

## 1. Goal
The goal of this Change Request is to expose the data entities used by the Procedural Character Bio Generator (Origins, Education, Careers, Life Events) in the application's Configuration UI. This will allow users to customize the "World Bible" by adding, editing, or removing the building blocks of character backstories without modifying the codebase.

## 2. Current Architecture
Currently, the `BioMachine` (`src/lib/generator/BioMachine.ts`) imports data directly from static JSON files located in `src/lib/generator/data/`.
- `origins.json`
- `education.json`
- `careers.json`
- `events.json`

This means the data is hardcoded at build time and cannot be modified by the user during runtime.

## 3. Proposed Solution

### 3.1. Data Persistence (Store Migration)
We will migrate the source of truth from static JSON files to the `EntityStore` (persisted via Dexie/IndexedDB).
- **New Store Slices**: Add `origins`, `education`, `careers`, and `lifeEvents` to the `EntityStore` (or a dedicated `BioStore` if `EntityStore` is too crowded, but `EntityStore` is the "World Bible" so it fits there).
- **Migration Logic**: On application startup (likely in `useStore` initialization or a dedicated migration effect), check if these tables are empty. If so, populate them with the data from the static JSON files.
- **Data Types**: Reuse existing interfaces from `BioMachine.ts` (`EventNode`, `LifeEvent`), ensuring they are exported and shared.

### 3.2. BioMachine Refactoring
Update `BioMachine` to decouple it from static imports.
- **Dependency Injection**: `BioMachine` should accept the datasets as arguments in its `generate` method or constructor, rather than importing them.
- **Integration**: The calling code (API route or Frontend `generate` function) will fetch the current data from the Store/DB and pass it to the `BioMachine`.

### 3.3. Configuration UI
Implement a new dedicated configuration interface.
- **Location**: Creates a new top-level configuration page at `/bio-config` (or similar dedicated route), distinct from General Settings or Locations.
- **Navigation**: Add a "Bio Generator" link to the main navigation menu (likely in `ClientLayout` or the main sidebar) alongside other high-level config options like "Characters", "Locations", etc.
- **Components**:
    - **Tabs**: Origins, Education, Careers, Events.
    - **List View**: `DataTable` to list items with search/filter.
    - **Editors**: Forms to edit `text`, `provides` (tags), `requires` (tags), and `weights`.

## 4. Work Plan

1.  **Backend/Store**:
    -   Define Zustand slices for Bio data in `src/lib/store/bioStore.ts`.
    -   Implement migration/initialization logic.
    -   Refactor `BioMachine` to accept data via dependency injection.
    -   Update usages of `BioMachine` to pass the stored data.

2.  **Frontend/UI**:
    -   Create `src/app/bio-config/page.tsx` (and layout if needed).
    -   Implement tabbed interface for the 4 data types.
    -   Implement generic CRUD components (list, edit modal) reusable for the 4 types (as they share the same schema structure).
    -   Update main navigation to include "Bio Generator".

## 5. Verification Plan

### Automated Tests
-   Unit tests for `BioMachine` passing in mock data (verifies decoupling).

### Manual Verification
1.  **Migration**: Clear Local Storage/IndexedDB, reload app. Verify "Bio Generator" settings are populated with default JSON data.
2.  **Editing**: Modify a Career (e.g., change "Investment Banker" to "Crypto Bro").
3.  **Generation**: Run the Character Generator. Verify the new data appears (e.g., character can be a Crypto Bro).
4.  **Persistence**: Reload and ensure changes persist.
