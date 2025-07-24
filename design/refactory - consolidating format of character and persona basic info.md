# OBJECTIVES

Currently character and persona have different formats.

export const CHARACTER_JSON_STRUCTURE = `{
  "id": string,
  "basicInfo": {
    "name": string,
    "age": number, // The character's age in years.
    "role": string,
    "faction": string,
    "reputation": string,
    "background": string,
    "firstImpression": string,
    "appearance": string
  },
  "personality": {
    "openness": number, // An integer between -100 and 100.
    "conscientiousness": number, // An integer between -100 and 100.
    "extraversion": number, // An integer between -100 and 100.
    "agreeableness": number, // An integer between -100 and 100.
    "neuroticism": number // An integer between -100 and 100.
  },
  "preferences": {
    "attractedToTraits": string[],
    "dislikesTraits": string[],
    "gossipTendency": "low" | "medium" | "high" // Must be one of "low", "medium", or "high".
  }
}`;

export const PERSONA_JSON_STRUCTURE = `{
  "playerProfile": {
    "name": string,
    "alias": string,
    "age": number, // The player's age in years.
    "reputation": string,
    "background": string,
    "firstImpression": string,
    "role": string,
    "faction": string,
    "appearance": string
  }
}`;


We want to consolidate the information for both character and persona basic info into a single structure:
"id": string,
"basicInfo": {
"name": string,
"age": number, // The character's age in years.
"role": string,
"faction": string,
"reputation": string,
"background": string,
"firstImpression": string,
"appearance": string
},

Personality and preferences remain character only attributes.

# DESIGN

We will create a new file `src/lib/types.ts` to define our object models, to better enable type sharing across the application.

```typescript
// src/lib/types.ts

export interface BasicInfo {
  name: string;
  age: number;
  role: string;
  faction: string;
  reputation: string;
  background: string;
  firstImpression: string;
  appearance: string;
}

export interface Character {
  id: string;
  basicInfo: BasicInfo;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  preferences: {
    attractedToTraits: string[];
    dislikesTraits: string[];
    gossipTendency: "low" | "medium" | "high";
  };
}

export interface Persona {
  id: string;
  basicInfo: BasicInfo;
}
```

To ensure the LLM receives the correct structural guidance, we will **modify**, not remove, the `CHARACTER_JSON_STRUCTURE` and `PERSONA_JSON_STRUCTURE` constants in `src/lib/prompts/generatorPrompts.ts`. The comments within these structures are critical for providing context to the LLM, such as the valid range for personality scores.

# IMPLEMENTATION

1.  **Create `src/lib/types.ts`**:
    *   Create the new file and add the `BasicInfo`, `Character`, and `Persona` interfaces as defined in the design section.

2.  **Update `src/lib/prompts/generatorPrompts.ts`**:
    *   Modify `CHARACTER_JSON_STRUCTURE` to use the `basicInfo` object, preserving the comments.
        ```typescript
        export const CHARACTER_JSON_STRUCTURE = `{
          "id": string,
          "basicInfo": {
            "name": string,
            "age": number, // The character's age in years.
            "role": string,
            "faction": string,
            "reputation": string,
            "background": string,
            "firstImpression": string,
            "appearance": string
          },
          "personality": {
            "openness": number, // An integer between -100 and 100.
            "conscientiousness": number, // An integer between -100 and 100.
            "extraversion": number, // An integer between -100 and 100.
            "agreeableness": number, // An integer between -100 and 100.
            "neuroticism": number // An integer between -100 and 100.
          },
          "preferences": {
            "attractedToTraits": string[],
            "dislikesTraits": string[],
            "gossipTendency": "low" | "medium" | "high" // Must be one of "low", "medium", or "high".
          }
        }`;
        ```
    *   Modify `PERSONA_JSON_STRUCTURE` to use the `basicInfo` object, removing the `playerProfile` nesting.
        ```typescript
        export const PERSONA_JSON_STRUCTURE = `{
          "id": string,
          "basicInfo": {
            "name": string,
            "alias": string,
            "age": number, // The player's age in years.
            "reputation": string,
            "background": string,
            "firstImpression": string,
            "role": string,
            "faction": string,
            "appearance": string
          }
        }`;
        ```

3.  **Refactor `src/components/character-configuration.tsx`**:
    *   Import the `Character` and `BasicInfo` types from `../lib/types`.
    *   Update the component’s props and internal state to use the `Character` type.
    *   Adjust form field data binding to work with the nested `basicInfo` object (e.g., `character.basicInfo.name`).

4.  **Refactor `src/components/persona-configuration.tsx`**:
    *   Import the `Persona` type from `../lib/types`.
    *   Update the component to use the `Persona` type.
    *   Change data access from `persona.playerProfile.name` to `persona.basicInfo.name`.

5.  **Update API Route `src/app/api/generate/character/route.ts`**:
    *   Modify the route to handle the new `Character` structure when generating and returning character data.

6.  **Update API Route `src/app/api/generate/persona/route.ts`**:
    *   Modify the route to handle the new `Persona` structure.

7.  **Update `src/lib/entityStore.ts`**:
    *   Import the new `Character` and `Persona` types.
    *   Update the store’s methods (`saveCharacter`, `getCharacter`, etc.) to align with the new data structures.