# Plan: LLM-Assisted Life Event Entity Generation

## Phase 1: Context & Tooling Preparation [checkpoint: 5c65ac1]
- [x] Task: Analyze current `BioEntity` and `Tag` schemas
    - [x] Sub-task: Read `src/lib/types.ts` (or relevant schema files) to identify the exact structure of Life Event entities and Tag definitions.
    - [x] Sub-task: Verify how weights are currently implemented in the Tag system.
- [x] Task: Define Zod Schema for LLM Output 51f1d96
    - [x] Sub-task: Create a Zod schema that enforces the structure of a `LifeEventEntity` and its associated `Tags`.
    - [x] Sub-task: Ensure strict typing for `weight` and `tag` fields.
- [x] Task: Conductor - User Manual Verification 'Context & Tooling Preparation' (Protocol in workflow.md) 5c65ac1

## Phase 2: Service Implementation
- [x] Task: Create Generation Service
    - [x] Sub-task: Implement a function `generateLifeEvents(sourceEntity, count, existingEvents, userPrompt)` in `src/lib/generator/` (or similar).
    - [x] Sub-task: Construct the LLM prompt, injecting the Source Entity details and strictly formatting the output instruction.
    - [x] Sub-task: Implement the call to the Vercel AI SDK (or existing LLM wrapper) using the defined Zod schema for `object` generation.
- [x] Task: Write Tests for Generation Service
    - [x] Sub-task: Create a unit test to mock the LLM response and verify that the output is correctly parsed into `LifeEvent` objects.
    - [x] Sub-task: Verify that generated Tags have valid weights.
- [x] Task: Conductor - User Manual Verification 'Service Implementation' (Protocol in workflow.md)

## Phase 3: Integration & UI Hook
- [x] Task: Create API Endpoint
    - [x] Sub-task: Expose the service via a Next.js API route (e.g., `POST /api/bio-config/generate-events`) to allow frontend access.
- [x] Task: UI Implementation (Basic)
    - [x] Sub-task: Add a "Generate Life Events" button/form to the Bio-Generator Configuration UI (likely near the Entity editor).
    - [x] Sub-task: Handle the API response and display the generated entities for review/saving.
- [x] Task: Conductor - User Manual Verification 'Integration & UI Hook' (Protocol in workflow.md)
