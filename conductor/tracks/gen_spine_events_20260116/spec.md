# Track: Gen Event functionality for Age Phases (Spine Nodes)

## Overview
Implement an LLM-powered generation tool for Spine Nodes within the Bio Generator Configuration UI. This feature will mirror the existing "Gen Events" functionality currently available for Life Events, allowing users to procedurally generate new background and milestone options (Spine Nodes) for specific Age Phases (Childhood, Formative, Professional, Senior).

## Functional Requirements
- **UI Integration**: Add a "Gen Events" button to the `BioDatasetEditor` toolbar when viewing any of the Age Phase tabs (Childhood, Formative, Professional, Senior).
- **Generation Logic**: 
    - Reuse the existing prompt-based generation approach used for Life Events.
    - Use the active Age Phase as the primary context for the LLM.
    - Ensure the LLM avoids duplicating existing Spine Nodes in that phase.
- **Persistence**: 
    - Generated Spine Nodes must follow the `EventNode` schema.
    - Successfully accepted items must be persisted to the correct store collection (`childhood`, `formative`, `professional`, or `senior`) via the appropriate `bioStore` action.
- **API Endpoint**: Implement or update a backend endpoint to handle the specific requirements of Spine Node generation (e.g., handling the `slot` and `phase` properties).

## Technical Implementation Details
- **Component Update**: Refactor `BioDatasetEditor.tsx` to display the `Sparkles` "Gen Events" button for all dataset types.
- **Dialog Refactoring**: Update `GenerateEventsDialog.tsx` to handle both `LifeEvent` and `EventNode` types, or create a flexible wrapper.
- **Prompt Engineering**: Adapt the LLM prompt to focus on generating "neutral" neutral spine entities that represent major life milestones or backgrounds for the given phase.

## Acceptance Criteria
- [ ] "Gen Events" button appears in Childhood, Formative, Professional, and Senior tabs.
- [ ] Clicking the button opens a dialog similar to the Life Events generator.
- [ ] LLM generates contextually appropriate milestones for the selected phase.
- [ ] User can review, "Add", and persist generated items to the local database.
- [ ] New tags discovered during generation are correctly registered in the system.

## Out of Scope
- Redesigning the core BioMachine engine.
- Implementing generation for the "Tags" tab.
