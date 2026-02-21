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
    * To fully utilize the bio-generator deterministically, the game needs the following explicit in-game entities:
      1. **Social Origin / Upbringing** (Mapping to bio-generator's `Origins` group).
      2. **Education Level / Path** (Mapping to bio-generator's `Education` group).
      3. **Housing / Wealth Status** (Mapping to bio-generator's `Housing` track).
      4. **Sibling Configuration** (Formalizing the `siblings` field to map to the `Siblings` group).
  * **Proposed Implementation Steps**:
    1. **Data Model Updates**: Expand `src/lib/types.ts` to include these missing attributes in the `BasicInfo` interface or as separate entities (similar to `Profession`).
    2. **Configuration Pages**: Create lightweight configuration pages (or expand existing ones) to manage these new in-game entities so the user can define available Origins, Education Paths, etc.
    3. **Character Configuration UI**: Expose these new in-game attributes as explicit dropdowns/fields within the "Character Configuration" page.
    4. **Deterministic Generation**: When the user clicks "Generate Background", the UI will pass the selected in-game attributes through the `SymbolicMapping` registry to resolve their corresponding bio-generator `nodeId`s. These IDs will be sent as `pinnedNodeIds` to the bio-generator, ensuring the generated narrative perfectly respects the explicitly configured in-game state.

