#OBJECTIVES

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



