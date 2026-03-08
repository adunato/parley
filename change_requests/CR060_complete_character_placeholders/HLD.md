# Complete Character Placeholders

## Status
Draft

## Goals
- Allow users to click a "Generate Character" button on a placeholder character's configuration page.
- Extend the character generation process to read the placeholder's existing "Relationships".
- Update the "Life Path Settings" of the generated character so they are consistent with the established relationships.
- Complete the details of the character seamlessly.
- **Export/Import Professions and Attribute Engine Data**: Export and import character attribute values (Professions and Attribute Engine) while keeping the same IDs to retain their associations with other entities (e.g., bio generator nodes).

## Proposed Solution
- Update the existing "Generate Character" button on the character configuration UI to handle the case when the character is marked as a placeholder.
- Modify the character generation logic (likely in `src/lib/generator/` or the API route) to accept existing relationships as input.
- Ensure the prompt provided to the LLM during generation incorporates these existing relationships, forcing the generated backstory and life path to align.
- Upon successful generation, hydrate the character's full details (bio, traits, etc.) while preserving the original relationships.
- **Add Import/Export Buttons**: In the `ProfessionList` and `AttributeManager` components, add features to export to a JSON file and import from a JSON file, directly updating `bioStore` and `entityStore` while maintaining original entity IDs.
