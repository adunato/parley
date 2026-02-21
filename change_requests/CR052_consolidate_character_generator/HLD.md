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
* **Generator Logic Application**:
  * Utilize `faker` library for structured, deterministic tabular data (name, age, attributes) and the LLM endpoint for unstructured prose (personality, background).
* **Bio-Generator Incorporation (Option B: Implicit Mapping with Exposed Spine)**:
  * Integrate the bio-generator directly into the Character Configuration page by exposing the **Spine Nodes** as selectable configuration options, while hiding the generated **Flesh Nodes**.
  * **Detailed Analysis of Exposed Fields**:
    * Spine nodes in the underlying data are defined as `EventNode`s assigned to specific `AgePhase`s (Childhood, Formative, Professional, Senior) and are categorized by `groupId` (e.g., Social Class, Siblings, Housing).
    * The Character Configuration UI will include a "Life Path (Spine)" section.
    * This section will dynamically render dropdown selectors for each available `groupId` of spine nodes (derived from `bioStore`'s `childhood`, `formative`, `professional`, and `senior` datasets).
    * Example exposed fields: *Childhood: Social Class (Poor, Middle Class, etc.), Siblings (0, 1, 2)*; *Formative: Education Path*; etc.
    * The user can manually pin these spine nodes via the dropdowns. 
    * A "Generate Background" action will feed these pinned spine node IDs into the bio-generator (`pinnedNodeIds`). The generator will silently create the "Flesh" events in the background and use the complete graph (Spine + Flesh) to prompt the LLM. 
    * The LLM's resulting narrative will be populated directly into the character's `Background` and `Personality` text areas, abstracting the complex event graph away from the user while retaining precise structural control.

