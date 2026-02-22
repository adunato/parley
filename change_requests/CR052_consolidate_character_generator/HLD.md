# Consolidate Procedural Character Generator into Character Configuration

## Status
Draft

## Goals
* Encapsulate the functionalities of the "Procedural Character Generator" directly into the "Character Configuration" page structure, while retaining it as a standalone element if needed.
* Allow the generation/regeneration of individual character elements (e.g., name, origin, age) directly from the Character Configuration page, using populated fields as context for generation.
* Resolve UI inconsistencies: remove overlapping generative buttons at the top of the page, and move the "Generate avatar" button near the Avatar element itself with an appropriate icon.
* Leverage generation logic efficiently: basic character information generated via `faker` library, while narrative text (biography, traits) generated via LLM calls.
* Address how back-end Life Path (bio-generator) output is mapped into the character configuration.

## Proposed Solution
* **Generation Options Integration**:
  * **Whole Character Generation**: Add a prominent "Generate Character" button that triggers the generation of all text-based fields (using populated fields as constraints/context where provided) except for the Avatar.
  * **Granular Generation**: Embed generative functionalities directly next to individual fields (e.g., small "wand" icons next to Name, Origin, Age) to allow regenerating a single field dynamically while considering the rest of the profile as context.
  * Adjust the "Generate Avatar" button and its icon to be placed closer to the avatar display component.
* **Bio-Generator Incorporation & In-Game Attribute Mapping**:
  * Instead of hiding the bio-generator logic, we will explicitly bridge the gap between the game's data model (`Character`) and the bio-generator's `EventNode` graph using the deterministic `SymbolicMapping` registry.
  * **Spine Node Categories (Bio-Generator)**:
    * The bio-generator currently supports the following spine node categories/groups: `Origins` (Childhood), `Education` (Formative), `Professions` (Professional), `Housing`, and `Siblings`.
  * **Current In-Game Entities (`Character` type)**:
    * The `Character` type currently explicitly supports `Role` (mapped to Professions) and `originLocation` (Country/State/Town, which is distinct from the bio-generator's social class "Origins"). It optionally has a `siblings` field, but it lacks strict typings/configuration.
  * **Delta Analysis (Missing In-Game Entities)**:
    * To fully utilize the bio-generator deterministically, the game needs explicit in-game entities for every logical grouping present in the bio-generator. Note that the bio-generator itself can be extended with new groups via `bioStore`.
    * Currently, we depend on the following bio-generator `groups.json` tracks that are not formally explicitly modeled in the game state other than as strings:
      1. **Origins** (Social Class / Starting Socioeconomic Background)
      2. **Education** (Education Level / Path)
      3. **Housing** (Property / Housing Status)
      4. **Siblings** (Family size)
      5. **Relationships** (Relationship History / Trajectory)
  * **Proposed Implementation Steps**:
    1. **Data Model Updates**: Expand `src/lib/types.ts` to formally include these missing attributes in the `BasicInfo` (or character-level) structure.
    2. **Dynamic Configuration Pages**: Create configuration pages allowing the user to manage the values for these new in-game entities (similar to how Professions are managed). By creating a generic pattern, the user can define available Origins, Education Paths, Relationship Histories, etc.
    3. **Character Configuration UI**: Expose these new in-game attributes as explicit dropdowns/fields within the "Character Configuration" page.
    4. **Deterministic Generation**: When the user clicks "Generate Background", the UI will pass the selected in-game attributes (Origins, Siblings, Housing, Education, Relationships) through the `SymbolicMapping` registry to resolve their corresponding bio-generator `nodeId`s. These IDs will be sent as `pinnedNodeIds` to the bio-generator, ensuring the generated narrative perfectly respects the explicitly configured in-game state.

### Addendum: Harmonizing Professions and Game Attributes
To simplify the BioGenerator's `SymbolicMapping` logic and treat `Professions` and `GameAttributes` organically as the same generic entity type during mapping, we will implement a unified `GameEntityRef` interface. 

Currently, `GameAttribute` (generic) and `Profession` (specific) are entirely disjointed arrays.

**Proposed Data Model Structure:**
1. **Introduce a Base Interface**:
```typescript
export interface BaseGameEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string; // 'profession' or a uuid from GameAttributeCategory
}
```
2. **Extend specialized types**:
```typescript
export interface Profession extends BaseGameEntity {
  categoryId: 'profession'; // Hardcoded category identifier
  minAge: number;
  maxAge: number;
}

export interface GameAttribute extends BaseGameEntity {
  // Uses dynamic categoryId from GameAttributeCategory
}
```
3. **Refactoring `SymbolicMapping`**:
Instead of the `SymbolicMapping` UI (in `bio-mapping-editor.tsx`) having to pull from `gameAttributes` AND conditionally pull from `professions`, we can create a unified getter in `useEntityStore` like `getAllMappableEntities()`, which returns an array of `BaseGameEntity`. 
The `category` property inside `SymbolicMapping` will simply correspond to `entity.categoryId`, and the `key` will correspond to `entity.id`. 
This allows the mapping UI to organically list "Professions" as just another category dropdown alongside "Origins", "Housing", etc., without any hacky conditional rendering logic.
