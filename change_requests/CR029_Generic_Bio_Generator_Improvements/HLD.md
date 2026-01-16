# High Level Design - CR029 Generic Bio Generator Improvements

## Goals
- Expose "Gen Events" prompt in Text Generation Settings.
- Persist Bio Graph filter settings (phases, node types) across tab switches.
- General improvements to the Bio Generator system.

## Proposed Solution
- Add `life_event_gen` to the allowlist in `src/components/settings/TextGenerationSettings.tsx`.
- Update `BioGraphContext` to save/restore filter state from `localStorage`.
- Ensure the prompt key exists in `PromptStore` (confirmed).

## UI/UX Changes
- TBD
