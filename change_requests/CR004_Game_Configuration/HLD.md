# High Level Design: Game Configuration (CR004)

## 1. Overview
This Change Request addresses the need for better data management within Parley. Users require the ability to:
1.  **Manage Worlds/Projects**: Save their game state (characters, stories, histories) as distinct "Projects" that can be exported, shared, or backed up.
2.  **Manage Configuration**: Persist and port their application settings (API keys, model preferences, prompt templates) across sessions or devices.

## 2. Terminology & Scope

### 2.1 World Project
A "World Project" encompasses all data specific to a particular gameplay universe.
*   **Source Stores**: `useEntityStore` and parts of `useParleyStore`.
*   **Scope**:
    *   World Description & Style
    *   Characters (including relationships)
    *   Character Groups
    *   Player Personas
    *   Chat History / Session Data
    *   *Excluded*: API Keys, Model choices (unless we decide a model is specific to a world, but usually that's a user pref).

### 2.2 Application Settings
"Application Settings" encompass the user's environment configuration.
*   **Source Stores**: `useParleyStore`.
*   **Scope**:
    *   LLM Model Selections (Chat, Summary, Generation)
    *   Avatar Generation Parameters (Steps, CFG, etc.)
    *   System Prompt Templates (treated as a global setting for now, though potentially overridable per project)

## 3. Data Architectures

### 3.1 World Project Export Schema (`project.parley.json`)
```typescript
interface ParleyProjectExport {
    version: number; // schema version (e.g. 1)
    timestamp: string; // ISO string
    metadata: {
        name: string; // User-defined or auto-generated name
        description?: string;
    };
    world: {
        description: string; // from ParleyStore.worldDescription
        style: string;       // from ParleyStore.aiStyle
    };
    entities: {
        characters: Character[];      // from EntityStore
        characterGroups: CharacterGroup[]; // from EntityStore
        playerPersonas: Persona[];    // from EntityStore
        relationshipDeltas: Relationship | undefined; // from EntityStore.cumulativeRelationshipDelta (if any)
    };
    session: {
        chatMessages: Message[];      // from ParleyStore
        chatSessionId: number;        // from ParleyStore
        selectedCharacterId?: string; // from EntityStore.selectedChatCharacter
        selectedPersonaId?: string;   // from EntityStore.selectedChatPersona
    };
}
```

### 3.2 Application Settings Export Schema (`settings.parley.json`)
```typescript
interface ParleySettingsExport {
    version: number;
    timestamp: string;
    models: {
        chatModel: string;
        summarizationModel: string;
        generationModel: string;
    };
    avatarGeneration: AvatarGenerationSettings;
    templates: {
        systemPrompt: string;
    };
}
```

## 4. UI/UX Design

### 4.1 World Info Page (`/world-info`)
This page will become the central hub for "World Project" management.

#### 4.1.1 Project Selection Area (Top of Page)
*   **Project Dropdown**: Selects the active project from the local library.
*   **"New" Button**: Creates a new, blank project (prompts for name).
*   **"Rename" Button**: Renames the currently selected project.
*   **"Save As" Button**: Clones the current project to a new name.
*   **"Export" Button**: Downloads the current project as a JSON file.
*   **"Import" Button**: Uploads a JSON file to create a new project in the library.
*   **"Delete" Button**: Deletes the current project (with confirmation).

#### 4.1.2 Existing Content
The existing World Description & AI Style editors remain below the selection area, editing the data of the *currently selected* project.

### 4.2 Settings Page (`/settings`)
*   **Configuration Management**: Retains "Export Settings" and "Import Settings" for application-level preferences.

## 5. Standard Entity Management Functions

We will standardize management across entities (Projects, Characters, Personas) where applicable, but specifically for **Project Management**, the following standard functions will be implemented in a new `ProjectService`:

1.  **List**: `getAllProjects()` - Returns metadata list of all stored projects.
2.  **Create**: `createProject(name: string)` - Initializes new project, switches to it.
3.  **Load**: `loadProject(id: string)` - Hydrates `ParleyStore` and `EntityStore` from the stored project data.
4.  **Save**: `saveProject(id: string, data: ProjectData)` - Persists current state to the storage slot.
    *   *Note*: Autosave should ideally happen on change, or explicitly. For Phase 1, we might rely on the existing `persist` middleware but we need to "swap" the persistence key or manually sync to a "Library" store.
    *   *Implementation Strategy*: We will introduce a `ProjectLibraryStore` that holds the *list* of projects. The "Active" project is what lives in `ParleyStore`/`EntityStore`. When switching projects, we:
        1.  Serialize current `ParleyStore` + `EntityStore` state.
        2.  Save that blob into `ProjectLibraryStore` (or `localStorage` under a unique key).
        3.  Load the target project blob.
        4.  Hydrate `ParleyStore`/`EntityStore`.
5.  **Rename**: `renameProject(id: string, newName: string)`.
6.  **Delete**: `deleteProject(id: string)`.
7.  **Clone/Save As**: `cloneProject(sourceId: string, newName: string)`.
8.  **Export**: `exportProject(id: string)` -> JSON File.
9.  **Import**: `importProject(file: File)` -> Validates and adds to library.

## 6. Implementation Details

### 6.1 `ProjectLibraryStore`
A new Zustand store to manage the registry of projects.
```typescript
interface ProjectMetadata {
    id: string;
    name: string;
    lastModified: number;
}

interface ProjectLibraryStore {
    projects: ProjectMetadata[];
    currentProjectId: string | null;
    // Actions...
    createProject: (name: string) => void;
    selectProject: (id: string) => void; 
    // ... maps to standard functions
}
```

### 6.2 Data Persistence Strategy
To avoid QuotaExceededErrors with a monolithic store:
*   `ProjectLibraryStore` only keeps metadata (ID, Name).
*   Each Project's full data is stored in `localStorage` (or `indexedDB` if needed later) under key `parley_project_${id}`.
*   **Active State**: `useParleyStore` and `useEntityStore` remain the "Active" state.
*   **Switching Logic**:
    *   `saveCurrent()`: `localStorage.setItem('parley_project_' + currentId, JSON.stringify(getAllState()))`
    *   `load(targetId)`: `const data = JSON.parse(localStorage.getItem('parley_project_' + targetId)); setAllState(data);`

### 6.3 Components
*   `ProjectManager.tsx`: The UI component for the dropdown and buttons, embedded in `WorldInfoPage`.

## 7. Execution Plan

1.  **Implements `ProjectLibraryStore`**: Structure and logic for managing the list.
2.  **Implement Storage Logic**: Functions to serialize/deserialize active stores to "Project Slots".
3.  **Update `WorldInfoPage`**: Integrate `ProjectManager` and the "Active World" logic.
4.  **Implement `Settings` Export/Import**: For app-level config.
5.  **Migration**: On first run, check if there is legacy data in the default keys. If so, wrap it into a "Default Project".
