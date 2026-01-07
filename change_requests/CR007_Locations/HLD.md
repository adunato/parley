# CR007 - Locations Feature HLD

## 1. Introduction
This Change Request introduces the concept of "Locations" to the Parley application. Characters will now be assigned to specific locations. The chat interface will allow filtering characters by location, and the location's description will be injected into the chat context.

## 2. Requirements
-   New `Location` entity (Name, Description).
-   Characters assigned to a single Location.
-   Personas are NOT assigned to locations.
-   Chat UI: Select Location -> Select Character (filtered).
-   Chat Prompt: Include Location Description in the system prompt.
-   Settings: Expose `locationDescription` variable for `chat_system` prompt.

## 3. Data Structures

### 3.1 New Location Entity (`src/lib/types.ts`)
```typescript
export interface Location {
    id: string;
    name: string;
    description: string;
    // image?: string; // Potential future requirement, not now
}
```

### 3.2 Update Character Entity (`src/lib/types.ts`)
```typescript
export interface Character {
    // ... existing fields
    locationId: string; // New field
}
```

## 4. Store Changes (`src/lib/entityStore.ts`)

-   Add `locations: Location[]` to state.
-   Add actions:
    -   `addLocation(location: Location)`
    -   `updateLocation(location: Location)`
    -   `deleteLocation(id: string)`
    -   `selectedChatLocation?: Location`
    -   `setSelectedChatLocation(location: Location | undefined)`

## 5. UI Changes (`src/app/chat/page.tsx`)

-   **State**: Add `selectedLocation` state (managed via store or local state if transient).
-   **Selection Logic**:
    -   Add `<Select>` for Locations before Character selection.
    -   Character `<Select>` options: Filter `characters` where `c.locationId === selectedLocation.id`.
    -   If no location selected, maybe show all or disable character select (Requirement implies "must now select a location first").

## 6. Logic & Prompt Engineering

### 6.1 Prompt Store (`src/lib/store/promptStore.ts`)
-   Update `chat_system` default prompt variables: Add `locationDescription`.
-   Update `chat_system` default template to include `{{locationDescription}}`.
    -   Positioning: Likely near `{{world}}` or `{{character}}`.

### 6.2 Chat Prompts (`src/lib/prompts/chatPrompts.ts`)
-   Update `generateSystemPrompt`:
    -   Accept `locationDescription` string.
    -   Add substitution logic for `{{locationDescription}}`.

### 6.3 Chat API (`src/app/api/chat/route.ts`)
-   Extract `locationDescription` from the character's location.
    -   *Note*: The API currently receives `character` object. The frontend should probably resolve the location description and pass it, OR the API needs access to the `Location` store (which is client-side zustand).
    -   *Decision*: Frontend pass `locationDescription` in the body, similar to `worldDescription`.

## 7. Configuration/Settings
-   The settings page dynamically renders variables from `promptStore`. By updating `DEFAULT_PROMPTS` in `promptStore.ts`, the new variable `locationDescription` will automatically appear in the settings UI for the `chat_system` prompt.

## 8. Migration Plan
-   Existing characters will have undefined `locationId`.
-   UI should handle `undefined` location (maybe a "Unassigned" pseudo-location or just hide them if strict enforcement).
    -   *Proposal*: Add a "Default Location" or "Unassigned" grouping for existing characters to avoid breaking them immediately.
