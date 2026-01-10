# CR015 - Location UI Updates

## Goal Description
Enhance the user experience for exploring locations and characters by introducing a detailed Location Screen and improving the World Map interaction. This includes creating a pop-up for map locations, a new dedicated Location Screen, and refactoring character presentations with new cards and relationship visualizations.

## Proposed Changes

### UI Components
#### [NEW] [LocationPopup](file:///C:/Users/danie/projects/parley/src/components/world/LocationPopup.tsx)
-   A Dialog component triggered by clicking a location pin on the map.
-   Reuses the style of `LocationManager` card but read-only.
-   Contains a "Visit Location" button that navigates to the Location Screen.

#### [NEW] [LocationScreen](file:///C:/Users/danie/projects/parley/src/app/location/[id]/page.tsx)
-   New page route: `/location/[id]/page.tsx`.
-   Displays:
    -   Location details (Name, Description, Image).
    -   List of characters at this location using the new `CharacterCard`.
    -   "Back to World Map" button (top left).

#### [NEW] [CharacterCard](file:///C:/Users/danie/projects/parley/src/components/character/CharacterCard.tsx)
-   Displays:
    -   Avatar (optimized component).
    -   Name.
    -   Age.
    -   Role.
    -   Relationship Bar (New Component).
    -   "Chat" button (redirects to Chat Page with this character and location pre-selected).

#### [NEW] [RelationshipBar](file:///C:/Users/danie/projects/parley/src/components/character/RelationshipBar.tsx)
-   Visual progress bar.
-   Calculates sum of Satisfaction, Commitment, Intimacy, Trust, Passion (0-100 each).
-   Displays average (0-100%).

### World Map Integration
#### [MODIFY] [WorldMapDisplay.tsx](file:///C:/Users/danie/projects/parley/src/components/world/WorldMapDisplay.tsx)
-   Update `onLocationClick` to trigger the `LocationPopup` instead of direct navigation or generic callback.
-   Needs to manage internal state for the open popup or lift state up.

#### [MODIFY] [WorldMapPage](file:///C:/Users/danie/projects/parley/src/app/world_map/page.tsx)
-   Integrate `LocationPopup`.

### Location Management
#### [MODIFY] [LocationManager.tsx](file:///C:/Users/danie/projects/parley/src/components/location-manager/location-manager.tsx)
-   Replace character name tags with mini avatars (using `Avatar` component from shadcn or custom).
