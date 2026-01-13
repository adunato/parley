# Track Spec: Dropdown for Tag Selection in Bio Configuration

## 1. Overview
The current implementation of the Bio Configuration editors uses free-text inputs for managing tags in "Provides", "Requires", and "Weights" sections. This leads to potential typos and inconsistent tag usage. This feature introduces a searchable dropdown (combobox) with "creatable" support to streamline tag entry while maintaining the ability to define new tags on the fly.

## 2. Functional Requirements
- **Searchable Dropdown (Combobox):** Replace free-text inputs for tags with a component that displays a list of existing tags from the `BioStore`.
- **Filtering Logic:** The dropdown must filter existing tags using a case-insensitive "contains" match as the user types.
- **Creatable Support:** If a user types a tag that does not exist in the current dataset, the system must allow them to add it.
- **Automatic Addition:** Pressing the "Add (+)" button or hitting "Enter" should accept the typed value as a tag, regardless of whether it existed previously.
- **Applicability:**
    - `BioEntityEditor`: Applied to "Provides Tags" and "Requires Tags" fields.
    - `WeightEditor`: Applied to the tag selection field when adding a new weight modifier.
- **Context:** The list of available tags should be pulled from the global `tags` array in `useBioStore`.

## 3. Non-Functional Requirements
- **Performance:** Filtering should be performant even with hundreds of tags.
- **UX/UI:** The dropdown should match the existing Shadcn/UI style used in the project.
- **Reusability:** Ideally, create or use a generic `TagSelector` component that can be used in both `BioEntityEditor` and `WeightEditor`.

## 4. Acceptance Criteria
- [ ] Typing in the tag field shows a list of matching existing tags.
- [ ] Tags are filtered correctly (case-insensitive, contains match).
- [ ] Selecting a tag from the list adds it to the entity configuration.
- [ ] Typing a new, non-existent tag and clicking "+" adds it to the configuration successfully.
- [ ] The functionality works in `BioEntityEditor` for both "Requires" and "Provides".
- [ ] The functionality works in the `WeightEditor`.

## 5. Out of Scope
- Modifying the `TagDatasetEditor` (where tags are formally defined/described).
- Advanced fuzzy matching logic.