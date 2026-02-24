# CR056: LLM Generated Relationship Placeholders

## Status
**Proposed Addendum 2 (Unique Target IDs)**

## Goals
- Stop passing the identical `GameAttribute` config UUID to the LLM for multiple spawn instances.
- Provide the LLM with a logically sound, unique "Target ID" for each relationship placeholder it needs to generate stats for.

## Proposed Solution (Addendum 2)

1. **Server-Side Prompt Injection (`src/app/api/generate/character/route.ts`)**:
   - When expanding the `placeholderRequirements` array by the `relatedCharacterCount`, we will assign a unique identifier string to each line (e.g., `placeholder_0`, `placeholder_1`).
   - Example Prompt Update:
     ```
     --- REQUIRED PLACEHOLDER RELATIONSHIPS ---
     You will be generating relationship statistics for the following placeholder characters:
     - 1x "Sibling" (Target ID: placeholder_0)
     - 1x "Sibling" (Target ID: placeholder_1)
     
     Each object MUST have the following structure:
     {
       "targetId": string, // MUST exactly match the Target ID provided above (e.g. "placeholder_0")
       "satisfaction": number,
       // ...
     }
     ```

2. **Client-Side Hydration (`character-configuration.tsx`)**:
   - The LLM will output the unique `targetId`. 
   - Since the client is looping through the actual `gameAttributes` configurations to spawn Characters, the client doesn't need to string-match the `targetId` from the LLM. It can rely strictly on the array order or simply use the `_used` state toggle as implemented previously, as long as the prompt's `placeholderRelationsips` output remains identically ordered.
   - However, for maximum safety, we can return the `attributeId` on a hidden field in the API's payload, or just continue to use iteration consumption. We will use sequential iteration matching the `gameAttribute` context to ensure perfect hydration.

## Verification Plan

### Automated Tests
- Typecheck with `npx tsc --noEmit`.

### Manual Verification
1. Inspect the server logs / LLM payload to verify the `_placeholderRequests` uses unique target IDs.
2. Verify the client correctly consumes the objects seamlessly.
