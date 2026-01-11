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
Implement a new configuration interface in the implementation.
- **Location**: Add a "Bio Generator" or "World Data" section to the `/settings` or `/locations` area (or a new top-level config page). given `locations` has its own page, maybe a `/world` page? Or just keep it in Settings for now as it's advanced config. Let's propose adding it to **Settings** -> **Bio Generator**.
- **Components**:
    - **Tabs**: Origins, Education, Careers, Events.
    - **List View**: `DataTable` to list items with search/filter.
    - **Editors**: Forms to edit `text`, `provides` (tags), `requires` (tags), and `weights`.
        - **Tag Editor**: A component to add/remove tags.
        - **Weight Editor**: A component to map Tags -> Multipliers.

## 4. Work Plan

1.  **Backend/Store**:
    -   Define Zustand slices for Bio data.
    -   Implement migration/initialization logic.
    -   Refactor `BioMachine` to accept data.
    -   Update `POST /api/generate/bio` (if applicable) or the client-side caller to pass data. Note: If generation happens server-side, we might need to send the data payload OR have the server read from a shared DB (but Next.js API routes might not share the client's IndexedDB easily unless we send the definition or use a server-side DB. *Correction*: Parley is a local-first app, often generation happens on client or via API. If via API, we might need to pass the context. `BioMachine` is currently in `src/lib`, checking usages will confirm if it runs on Client or Server.
        -   *Check*: `BioMachine` is likely used in an API route. If so, server-side cannot read Client IndexedDB.
        -   *Solution*: Pass the Bio Configuration as part of the request body to the generation endpoint, or run BioMachine on the client side (it's pure logic, no secrets). Running on client is preferred for Local-First apps to avoid payload limit issues and latency, unless we need server-side LLM calls *after* the BioMachine. BioMachine Layer 3 uses LLM.
        -   *Refined Plan*: Move BioMachine execution fully to Client (if not already) or pass the necessary data definitions in the API request. Given the data size might be large, Client-side execution of "Spine" and "Flesh" layers is best, then send the result to the LLM for "Skin" layer.

2.  **Frontend/UI**:
    -   Create `BioSettings` page.
    -   Implement CRUD for all 4 data types.

## 5. Verification Plan

### Automated Tests
-   Unit tests for `BioMachine` passing in mock data (verifies decoupling).

### Manual Verification
1.  **Migration**: Clear Local Storage/IndexedDB, reload app. Verify "Bio Generator" settings are populated with default JSON data.
2.  **Editing**: Modify a Career (e.g., change "Investment Banker" to "Crypto Bro").
3.  **Generation**: Run the Character Generator. Verify the new data appears (e.g., character can be a Crypto Bro).
4.  **Persistence**: Reload and ensure changes persist.
