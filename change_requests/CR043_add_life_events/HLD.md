# Add Life Events to Bio Dataset

## Status
Draft

## Goals
- Populate the `lifeEvents` section of the bio dataset `parley-bio-dataset-parley-bio-world-2026-01-17-2026-01-24.json`.
- Ensure each spine node (in Childhood, Formative, Professional, Senior) has 2-3 specific life events attached to it.
- Ensure these life events do not provide any new tags.

## Proposed Solution
1.  **Script Creation**: specific script to process the JSON file.
2.  **Generation Logic**:
    - Iterate over `childhood`, `formative`, `professional`, and `senior` arrays in the JSON.
    - For each entity, invoke the LLM (Deepseek) to generate 2-3 tailored life events.
    - **Context**: Use the entity's description (`text`) and provided tags (`provides`) to ground the generation.
    - **Attachment**: Assign high weights (e.g., 50+) to the generated events for the tags provided by the spine node, effectively "attaching" them.
    - **Constraints**: Force `provides` to be empty/undefined for all generated events.
3.  **Output**: Update the JSON file with the new `lifeEvents` list, merged with any existing ones (currently empty).
4.  **Verification**: Manual inspection of the JSON to verify count (2-3 per node) and tag constraints.
