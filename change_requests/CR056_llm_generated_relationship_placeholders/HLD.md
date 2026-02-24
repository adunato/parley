# CR056: LLM Generated Relationship Placeholders

## Status
**Proposed**

## Goals
- Allow the LLM to generate the initial relationship statistics (satisfaction, commitment, intimacy, trust, passion) and a narrative description for automatically generated placeholder characters (e.g., Siblings, Partners).
- Pass these generated statistics to the client so that when placeholders are created, their relationships with the main character are deep, nuanced, and contextually rich, rather than defaulting to generic "50/50" values.
- Ensure the LLM generation doesn't break the existing JSON structural format or the deterministic demographic rules (like name inherited origin country) we established in CR055.

## Proposed Solution

1. **Client-Side Preparation (`src/components/character-configuration.tsx`)**:
   - The `generateCharacter` API call already sends `existingContext` which includes `mappedAttributes`.
   - We will need to pass the `gameAttributes` dictionary to the API call so the server can cross-reference the `relatedCharacterCount` and understand *how many* placeholders of each type need to be generated before invoking the LLM.

2. **Server-Side Prompt Injection (`src/app/api/generate/character/route.ts` & `src/lib/prompts/generatorPrompts.ts`)**:
   - Inside `route.ts`, after the dynamic `mappedAttributes` are resolved from the `BioMachine` (Step 3), we will scan them against the provided `gameAttributes`. 
   - We will compile a list of required placeholders (e.g., "1 Sibling, 1 Married Partner").
   - If placeholders are required, we append a new section to `combinedContext._simulatedLifePath` or as a new variable: `_placeholderRequests`, instructing the LLM to generate stats for these specifically typed relationships.
   - We modify `CHARACTER_JSON_STRUCTURE` internally in the prompt builder (or simply inject the requirement into the prompt) to expect an optional `placeholderRelationships: { type: string, satisfaction: number, commitment: number, intimacy: number, trust: number, passion: number, description: string }[]` array.

3. **Reassembly and Client Instantiation (`src/app/api/generate/character/route.ts` & `src/components/character-configuration.tsx`)**:
   - The server extracts the `placeholderRelationships` array from the LLM's JSON and sends it back alongside the `character` data.
   - During the client-side placeholder instantiation loop, we match each newly created placeholder against the unused stats in the returned `placeholderRelationships` array (matching by `type`).
   - We apply the LLM-generated relationship metrics (and the description) to the new `Relationship` object binding the two characters.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure the new optional `placeholderRelationships` array matches through our API and component interfaces.

### Manual Verification
1. Open the UI and generate a character assigned to an attribute that creates placeholders (e.g., "Married").
2. Check the Relationship Accordion for the generated character. 
3. Validate that the relationship stats (satisfaction, trust, etc.) are varied logically rather than static `50`s, and that the relationship description contains a custom narrative from the LLM instead of the generic "Auto-generated Married relationship."
