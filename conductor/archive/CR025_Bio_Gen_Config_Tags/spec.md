# Specification: Bio Generator Configuration - Influenced By Tags

## 1. Overview
The Bio Generator Configuration table needs to be updated to provide more transparency regarding how different configuration items are influenced by tags. A new column "Influenced by" will be added to the table, displaying the tags and their associated weights in a `TAG:weight` format.

## 2. Requirements

### 2.1 UI Changes
*   **Target Component:** The table displaying Bio Generator Configuration items (likely within `src/components/bio-config/`).
*   **New Column:** Add a column header named "Influenced by".
*   **Cell Content:** For each row, display the influencing tags and their weights.
*   **Format:** `TAG:weight` (e.g., `WARRIOR:0.8`, `MAGE:0.2`). Multiple tags should be visually separated (e.g., comma-separated or badges).

### 2.2 Data Changes
*   Verify if the "Influenced by" data (tags and weights) is currently available in the frontend data model.
*   If missing, update the API or data fetching logic to retrieve this information from the backend/store.

## 3. Implementation Details
*   **Files Likely Affected:**
    *   `src/components/bio-config/` (Table component)
    *   `src/lib/types.ts` (Type definitions)
    *   `src/app/api/bio-config/` (API route, if data fetch needs update)

## 4. Acceptance Criteria
*   The Bio Generator Configuration table includes an "Influenced by" column.
*   The column correctly displays `TAG:weight` pairs for each item.
*   The application builds and runs without errors.
