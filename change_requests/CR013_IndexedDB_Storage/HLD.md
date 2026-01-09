# HLD: Migrate LocalStorage to IndexedDB (Dexie.js)

## 1. Goal
Replace `localStorage` with `IndexedDB` using `Dexie.js` to overcome storage quotas and improve performance for larger datasets (e.g. images).

## 2. Architecture
### 2.1 Database Schema (Dexie)
*   **Database Name**: `ParleyDB`
*   **Tables**:
    *   `projects`: `id` (PK), `name`, `lastModified`, `data` (Blob/Object)
    *   `keyvalues`: `key` (PK), `value` (Object) - For generic Zustand store persistence.

### 2.2 Zustand Adapter
A `DexieStorageAdapter` will be created to bridge Zustand's `persist` middleware with Dexie's async API.

### 2.3 Store Updates
*   `useGameStore`: Switch storage to `DexieStorageAdapter`.
*   `useEntityStore`: Switch storage to `DexieStorageAdapter`.
*   `useParleyStore`: Switch storage to `DexieStorageAdapter`.
*   `useProjectLibraryStore`: Switch storage to `DexieStorageAdapter`.

### 2.4 ProjectService Refactor
*   `saveProject`: Write full project data to `projects` table.
*   `loadProject`: Read from `projects` table.
*   `deleteProject`: Delete from `projects` table.

## 3. Migration
A one-off migration function `migrateLocalStorageToDexie()` will:
1.  Scan `localStorage` for `parley_project_*` keys.
2.  Parse and insert them into the `projects` table.
3.  Remove migrated keys from `localStorage`.
4.  (Optional) Migrate key-value stores if simple.

## 4. Verification
*   Create new projects, save, reload -> Verify persistence.
*   Check IndexedDB in browser devtools.
*   Verify NO new `localStorage` writes for project data.
