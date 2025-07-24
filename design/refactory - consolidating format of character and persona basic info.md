# OBJECTIVES

Currently character and persona have different formats. We want to consolidate the information for both character and persona basic info into a single structure.

We also want to improve how we manage the JSON structures that we use to guide the LLM. Currently, these are stored as template literals in the prompt files. This makes them hard to manage and reuse.

We will move to a system where we define the structures in JSON5 files. This will allow us to have comments in the files, which are useful for developers. We will then programmatically convert these JSON5 files into JSONC strings with inline comments, which is the format the LLM prefers.

# DESIGN

1.  **JSON5 for Structure Definitions:** We will create a new directory `src/lib/json5` to store our JSON5 structure definitions. We will create `character.json5` and `persona.json5` files. The comments will be placed *above* the fields.

    *   `src/lib/json5/character.json5`:
        ```json5
        {
          "id": "string",
          "basicInfo": {
            "name": "string",
            // The character's age in years.
            "age": "number",
            "role": "string",
            "faction": "string",
            "reputation": "string",
            "background": "string",
            "firstImpression": "string",
            "appearance": "string"
          },
          "personality": {
            // An integer between -100 and 100.
            "openness": "number",
            // An integer between -100 and 100.
            "conscientiousness": "number",
            // An integer between -100 and 100.
            "extraversion": "number",
            // An integer between -100 and 100.
            "agreeableness": "number",
            // An integer between -100 and 100.
            "neuroticism": "number"
          },
          "preferences": {
            "attractedToTraits": ["string"],
            "dislikesTraits": ["string"],
            // Must be one of "low", "medium", or "high".
            "gossipTendency": "string"
          }
        }
        ```

2.  **Comment Transposition:** We will create a new file `src/lib/json5-parser.ts` that will read a JSON5 file, and transpose the comments from above a field to inline with the field.

3.  **Update Prompts:** We will update `src/lib/prompts/generatorPrompts.ts` to use the new JSON5 parser to generate the JSONC strings for the LLM.

# IMPLEMENTATION

1.  **Create `src/lib/json5` directory and files:**
    *   Create the `src/lib/json5` directory.
    *   Create `src/lib/json5/character.json5` and `src/lib/json5/persona.json5` with the content defined in the design section.
2.  **Create `src/lib/json5-parser.ts`:**
    *   Implement a function that reads a JSON5 file.
    *   The function will parse the JSON5 and create a JSONC string with inline comments.
3.  **Update `src/lib/prompts/generatorPrompts.ts`:**
    *   Import the parser from `src/lib/json5-parser.ts`.
    *   Use the parser to generate the `CHARACTER_JSON_STRUCTURE` and `PERSONA_JSON_STRUCTURE` strings.
4.  **Refactor `src/components/character-configuration.tsx`**:
    *   Import the `Character` and `BasicInfo` types from `../lib/types`.
    *   Update the component’s props and internal state to use the `Character` type.
    *   Adjust form field data binding to work with the nested `basicInfo` object (e.g., `character.basicInfo.name`).

5.  **Refactor `src/components/persona-configuration.tsx`**:
    *   Import the `Persona` type from `../lib/types`.
    *   Update the component to use the `Persona` type.
    *   Change data access from `persona.playerProfile.name` to `persona.basicInfo.name`.

6.  **Update API Route `src/app/api/generate/character/route.ts`**:
    *   Modify the route to handle the new `Character` structure when generating and returning character data.

7.  **Update API Route `src/app/api/generate/persona/route.ts`**:
    *   Modify the route to handle the new `Persona` structure.

8.  **Update `src/lib/entityStore.ts`**:
    *   Import the new `Character` and `Persona` types.
    *   Update the store’s methods (`saveCharacter`, `getCharacter`, etc.) to align with the new data structures.
