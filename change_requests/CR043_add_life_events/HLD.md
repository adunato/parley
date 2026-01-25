# Add Life Events to Bio Dataset

## Status
Draft

## Goals
- Populate the `lifeEvents` section of the bio dataset `parley-bio-dataset-parley-bio-world-2026-01-17-2026-01-24.json`.
- Ensure each spine node (in Childhood, Formative, Professional, Senior) has 2-3 specific life events attached to it.
- Ensure these life events do not provide any new tags.

## Proposed Solution
1.  **Manual Generation**: I (Antigravity) will manually author the JSON objects for the `lifeEvents` array.
2.  **Content Strategy**: 
    - For each entity in `childhood`, `formative`, `professional`, and `senior`:
        - Create 2-3 `LifeEvent` objects.
        - **Text**: Thematic to the spine entity.
        - **Weights**: configured to trigger based on the spine entity's `provides` tags (e.g., if Spine Node A provides `TAG_A`, the Linked Event will have `{ "TAG_A": 50 }`).
        - **Provides**: Empty (to avoid graph explosion).
        - **Requires**: Empty (relying on weights for soft links) or matching the tag for Hard links if appropriate (Weights preferred for variety).
3.  **Verification**: ensure the JSON is valid and the graph looks populated.
