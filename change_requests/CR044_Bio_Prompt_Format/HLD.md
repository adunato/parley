# High-Level Design: Bio Prompt & UI Updates

**Change Request:** CR044
**Status:** PROPOSED

## Goals
1.  **Prompt Formatting**: Pass structured, phase-grouped history to the Bio Writer LLM prompt.
2.  **UI Visualization**: Show the life phase in which a "Flesh" event occurred in the UI.

## Problem Statement
Currently, the Bio Writer prompt receives a flat list of life events, losing the context of *when* they happened. Similarly, the UI displays life events without phase context, even though the simulation determines them per phase.

## Proposed Solution
1.  **BioMachine Update**: Capture the `phase` during simulation and attach it to the `LifeEvent` object in the resulting `BioState`.
2.  **Prompt Update**: Refactor the prompt variable construction in the API route to group both Spine and Flesh events by phase.
3.  **UI Update**: Render the captured `phase` in the Bio Generator dialog.

## Detailed Design
*   **Types**: Extend `BioState.flesh` elements to include `generatedPhase: AgePhase`.
*   **Logic**: In `BioMachine.simulatePhaseFlesh`, spread the event object and add `generatedPhase: phase`.
*   **API**: Iterate through `flesh` events, grouping them by `generatedPhase`, then formatting them into the `*PhaseName*\nEvent\nEvent` style requested.

## Impact
*   **Bio Quality**: LLM will have better context on chronology.
*   **UX**: Users will see when random events occurred.
