# High Level Design: World Map and Locations

## 1. Goal
Introduce a "World Map" concept to the application, allowing users to upload a world map image, visualize locations on it with custom icons, and interact with the map via a new full-screen view.

## 2. Requirements

### 2.1 World Configuration
-   **Map Image**: Users can upload a world map image (expected 2560x1440) in the World Info configuration.
-   **Display**: The map image is displayed in the configuration panel.

### 2.2 Location Configuration
-   **Location Image**: Locations can now have an associated image.
-   **Map Integration**: Locations will be displayed as circular, cropped icons on the world map.
-   **Positioning**: Users can add locations to the map and drag them to position. Coordinates are saved.

### 2.3 World Map Screen
-   **New Screen**: A new route `/world_map` accessible from Main Menu (New/Continue).
-   **Full Screen**: The map covers the full screen (no horizontal scroll).
-   **Pins**: Displays configured location icons at their stored coordinates.

## 3. Architecture Changes

### 3.1 Data Structures (`src/lib/types.ts`)
-   Update `Location` interface:
    ```typescript
    export interface Location {
        id: string;
        name: string;
        description: string;
        image?: string;         // Base64 or URL
        coordinates?: {         // % positions 0-100
            x: number;
            y: number;
        };
    }
    ```

### 3.2 State Management (`src/lib/store.ts`)
-   Update `ParleyStore` to hold the World Map image:
    ```typescript
    worldMapImage: string | null;
    setWorldMapImage: (image: string | null) => void;
    ```

### 3.3 UI Components
-   **`WorldInfoPage` (`src/app/world-info/page.tsx`)**: Add Image Upload component for World Map.
-   **`LocationManager` (`src/components/location-manager/location-manager.tsx`)**:
    -   Add Image Upload for Location.
    -   Integrate `WorldMapEditor` (new component) to allow placing and dragging location pins.
-   **`WorldMapPage` (`src/app/world_map/page.tsx`)**: New page to render the read-only full-screen map.
-   **New Components**:
    -   `WorldMapEditor`: Interactive map for placing pins.
    -   `WorldMapDisplay`: Read-only map display.
    -   `LocationPin`: Reusable circular icon component.

## 4. Implementation Details

-   **Image Storage**: For this MVP, images will be stored as Base64 strings in `localStorage` (via Zustand persistence). *Note: Large images might hit quota limits, but acceptable for MVP.*
-   **Coordinates**: Stored as percentages (0-100) to remain responsive across different screen sizes.
-   **Navigation**: Update Main Menu to route "New Game" and "Continue" to `/world_map` (or add logic to determine where to go).

## 5. Security & Performance
-   **Image Size**: Client-side resize/compression might be needed if Base64 strings are too large for localStorage.
-   **Validation**: Ensure images are valid image files.
