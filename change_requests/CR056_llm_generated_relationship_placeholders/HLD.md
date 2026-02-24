# CR056: LLM Generated Relationship Placeholders

## Status
**Proposed Addendum (Strict ID Mapping)**

## Goals
- Address the fuzzy-matching ambiguity where the LLM might return "Sibling" instead of "Two Siblings".
- Enforce strict deterministic mapping between the generated placeholder relationship stats and the actual `GameAttribute` UUID that spawned them.
- Eliminate all fuzzy logic or `toLowerCase()` string checks.

## Proposed Solution (Addendum)

1. **Server-Side Prompt Injection (`src/app/api/generate/character/route.ts`)**:
   - Instead of asking the LLM to output a `type` string (e.g. "Married"), we will explicitly instruct the LLM to output an `attributeId` string that corresponds exactly to the UUID of the `GameAttribute` we are requesting placeholders for.
   - Example Prompt Update:
     ```
     --- REQUIRED PLACEHOLDER RELATIONSHIPS ---
     You will be generating relationship statistics for the following placeholder characters:
     - 1x "Married" (ID: "daffbc54-8346-479a-b6fd-f3a65ed366cc")
     
     Each object MUST have the following structure:
     {
       "attributeId": string, // MUST exactly match the ID provided above (e.g. "daffbc54-8346-479a-b6fd-f3a65ed366cc")
       "satisfaction": number,
       // ...
     }
     ```

2. **Client-Side Hydration (`character-configuration.tsx`)**:
   - The loop that instantiates new placeholders already knows the `attr.id` of the `GameAttribute` it is currently processing.
   - We will replace the `findIndex` logic to do a strict, === comparison: `r.attributeId === attr.id`. 
   - We will remove all `substring` and `toLowerCase()` checks.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure the removal of `type` and introduction of `attributeId` on the expected LLM return shape passes type checks.

### Manual Verification
1. Open the UI and generate a character assigned to an attribute that creates placeholders (e.g., "Married").
2. Check the console and the Relationship Accordion for the generated character to ensure the stats flowed correctly without relying on fuzzy text.
