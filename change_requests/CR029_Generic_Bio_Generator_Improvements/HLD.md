# High Level Design - CR029 Generic Bio Generator Improvements

## Goals
- Expose "Gen Events" prompt in Text Generation Settings.
- Persist Bio Graph filter settings (phases, node types) across tab switches.
- Port "Gen Events" functionality to the top-level "Life Events" tab.
- General improvements to the Bio Generator system.

## Proposed Solution
- Add `life_event_gen` to the allowlist in `src/components/settings/TextGenerationSettings.tsx`.
- Update `BioGraphContext` to save/restore filter state from `localStorage`.
- Update `GenerateEventsDialog` to handle optional `sourceEntity`.
- Update `lifeEventGenerator` API to support generation without a source entity.
- Add "Gen Events" button to the Life Events tab in `BioDatasetEditor`.
- Ensure the prompt key exists in `PromptStore` (confirmed).

## UI/UX Changes
- TBD
