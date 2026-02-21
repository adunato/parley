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
* **UI Integration**:
  * Modify the `CharacterConfiguration` component to embed generative functionalities directly next to relevant fields (e.g., small "wand" icons next to inputs for Name, Origin, etc.).
  * Remove or refine the overarching "Auto generate" and "Generate with Prompt" buttons that conflict with granular generation.
  * Adjust the "Generate Avatar" button and its icon to be placed closer to the avatar display component.
* **Granular Generation**:
  * Build specific single-field generation functions (or targeted updates to existing generators) that use the current state of other character fields as context (e.g., generating a fitting name based on the selected origin location).
* **Generator Logic Application**:
  * Ensure the logic flow relies on `faker` for structured tabular data (name, age, attributes) and the LLM endpoint for unstructured prose (personality, background).
* **Life Path Settings Integration (Open Question)**:
  * See options below.

## Open Questions & Options

### How to incorporate bio-generator / Life Path Settings logic into the page?

**Option A: Explicit Mapping (Graph Visibility)**
* **Description:** Expose the underlying spine/flesh nodes directly within the Character Configuration UI, perhaps in a dedicated "Life Path" tab or collapsible panel.
* **Pros:** Complete transparency for advanced users; fine-grained control over the character's journey.
* **Cons:** Increases UI complexity significantly; might be overwhelming for regular character creation and strays from a clean configuration page.

**Option B: Implicit Mapping (Transparent Generation)**
* **Description:** Hide the spine/flesh nodes entirely from the Character Configuration UI. The user clicks "Generate Background" (or similar), and the generator works in the backend. Only the final mapped fields (e.g., education, siblings) and narrative text are updated in the UI.
* **Pros:** Cleanest, most user-friendly UI. Abstracts away the complexity of the node graph from the standard character creation flow.
* **Cons:** Less granular control over individual life events during the character creation phase; the user accepts the whole package.

**Option C: Hybrid (Simplified Life Path Selections)**
* **Description:** Provide high-level "Life Path Settings" drop-downs or toggles (e.g., "Wealthy Upbringing", "Tragic Event") that act as seeds. The backend bio-generator uses these to guide the graph/node generation implicitly, mapping the output down to standard fields.
* **Pros:** Balances user agency with UI simplicity and clear cause-effect mapping.
* **Cons:** Requires mapping these high-level seeds to the more complex underlying node rules.

Please review the options above and specify which approach you prefer for the Life Path Settings integration.
