# Complete Character Placeholders

## Status
Draft

## Goals
- Allow users to click a "Generate Character" button on a placeholder character's configuration page.
- Extend the character generation process to read the placeholder's existing "Relationships".
- Update the "Life Path Settings" of the generated character so they are consistent with the established relationships.
- Complete the details of the character seamlessly.

## Proposed Solution
- Add a "Generate Character" button to the character configuration UI specifically when the character is marked as a placeholder.
- Modify the character generation logic (likely in `src/lib/generator/` or the API route) to accept existing relationships as input.
- Ensure the prompt provided to the LLM during generation incorporates these existing relationships, forcing the generated backstory and life path to align.
- Upon successful generation, hydrate the character's full details (bio, traits, etc.) while preserving the original relationships.
