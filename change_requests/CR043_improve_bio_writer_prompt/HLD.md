# CR043: Improve Bio Writer Prompt

## Status
Draft

## Goals
- Fix the issue where the bio writer prompt repeats the entire spine history multiple times.
- Ensure the prompt uses descriptive text for spine nodes instead of internal IDs.
- Organize the life history sequentially and clearly by age phase.
- Ensure consistency between configured age phases and the generated prompt.

## Proposed Solution

### 1. Update Prompt Template (`src/lib/store/promptStore.ts`)
- Modify the `bio_writer` template to remove the redundant `{{spine}}` placeholders.
- Consolidate the history into a single section or use specific placeholders if we want to enforce structure, but a dynamic list is better for variable phases.
- **Proposed Template:**
  ```markdown
  You are writing a biography for a character in a {{aiStyle}} story.

  **Facts (Do NOT contradict these):**
  * Identity: {{identity}}
  * Life History:
  {{spine}}
  * Key Life Events:
  {{flesh}}

  Write a 2-paragraph background story weaving these facts together naturally. Focus on their psychology and current state.
  ```

### 2. Update Generation Logic (`src/app/api/generate/bio/route.ts`)
- Update the `spine` variable construction:
    - Iterate through the incoming `spine` array (which represents the character's life path).
    - Map each node to a string format like `* [Phase Name]: [Description]`.
    - Use the `text` or `description` field of the spine node instead of `id`.
    - Ensure the order is preserved (Childhood -> Formative -> etc.).
- Update the `flesh` variable construction to use descriptions if not already doing so (it seems to use `text` already).

### 3. Verification
- Manual verification by generating a bio and checking the logs/output to ensure the prompt sent to the LLM is clean and correct.
- Verify the `bio` output is coherent and follows the facts.

## Schema Changes
None.
