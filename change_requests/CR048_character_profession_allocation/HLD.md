# Title: CR048 Character Profession Allocation

## Status
Draft

## Goals
* Shift the location assignment paradigm: characters are assigned to a location by filling a "Profession Slot" *at* the location.
* Make the character's location field read-only in the character configuration UI.
* A location defines how many and what type of professionals it needs via "Profession Slots".
* Each slot can optionally be filled by a character with the matching profession.
* Filling a slot automatically updates the assigned character's `locationId`.

## Proposed Solution

### 1. Data Model Updates
* **`Location` Interface (`src/lib/types.ts`)**:
  * Add a new property `professionSlots: ProfessionSlot[]`.
  * Define a new interface `ProfessionSlot`:
    ```typescript
    export interface ProfessionSlot {
      id: string; // Unique ID for the slot
      professionId: string; // The required profession
      characterId?: string; // The character assigned to this slot (optional)
    }
    ```

### 2. UI / UX Impacts
* **Character Configuration (`src/components/character-configuration.tsx`)**:
  * **Location Display**: Change the location dropdown to a read-only display.
    * It will show the current location name (derived from `displayCharacter.locationId`), and state that locations are managed from the Location Configuration page.
  * **Profession Change Edge Case**: If a user changes a character's profession (`role`), and that character is currently assigned to a Profession Slot in a Location, the system should automatically:
    1. Unassign the character from the slot in the Location.
    2. Set the character's `locationId` to `undefined`.
    3. Display a toast notification explaining the unassignment due to profession mismatch.

* **Location Manager (`src/components/location-manager/location-manager.tsx`)**:
  * **Edit Location Form**: Add a new dedicated "Staffing" or "Profession Slots" tab/section.
  * **Slot Management UI**:
    * Ability to "Add Slot".
    * For each slot, a dropdown to select the `professionId` (from available professions).
    * If a profession is selected, show a dropdown to assign a `characterId`. This dropdown should ONLY list characters whose current profession (`role`) matches the slot's `professionId`, AND who are not already assigned to another slot (or at least provide a clear visual indicator if they are being moved).
    * Ability to "Remove Slot" (which frees the assigned character if there is one).
  * **Entity Store Updates**:
    * Assigning a character to a slot must trigger an update to the Location (saving the slot with the `characterId`) AND an update to the Character (setting their `locationId` to this Location's ID).
    * Taking a character out of a slot must clear the character's `locationId`.

### 3. Engine / State Impacts
* The `useEntityStore` or component-level logic must handle the dual-update (Location + Character) carefully to ensure data consistency, utilizing the debounced save functions cleanly.
