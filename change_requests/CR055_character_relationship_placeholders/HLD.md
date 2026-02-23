# CR055: Character Relationship Placeholders

## Status
Draft

## Goals
- Automatically generate placeholder characters for relationships (e.g., siblings, partners) upon main character generation.
- Propagate demographic values from the source character to placeholders (shared origin location, similar age, shared last name).
- Rework existing `Relationship` data model to allow character-to-character links with a flexible string-based `Relationship Type`.
- Make the generation rules configurable by adding a single integer to the attribute configuration (similar to how `Profession` has age ranges) to indicate the number of placeholders to create.

## Proposed Solution

### 1. Data Model Updates (`src/lib/types.ts`)
- **Relationship Interface:**
  - Update `Relationship` interface to support general entity links.
  - Add `targetId: string;` (replacing strictly `personaId`, though we might keep `personaId` optional for backward compatibility or use a generic `targetId`).
  - Add `type: string`. This will no longer be a hardcoded set. Instead, it will be dynamically assigned based on the source attribute name.
- **GameAttribute Interface:**
  - Turn attributes within the "Siblings" and "Relationships" categories into special attributes (similar to `Profession`).
  - Add an optional integer field (e.g., `relatedCharacterCount?: number`) to the attribute configuration. This integer defines exactly how many placeholders to generate for that attribute.

### 2. Procedural Character Generator Modifications (`src/lib/generator/`)
- During the `generateCharacter` flow, after the main character's `basicInfo` and `mappedAttributes` are resolved:
  - The engine checks mapped attributes for the `relatedCharacterCount` value.
  - If the attribute belongs to the "Siblings" category (or a dynamically identified sibling category) and `relatedCharacterCount > 0`:
    - Create $N$ placeholder characters (where $N$ is `relatedCharacterCount`).
    - **Relationship Type:** Hardcoded to `"sibling"`.
    - **Propagation Rules:** Same `originLocation`, same last name (parsed from main character's given name), randomly selected age within `±10` years, random valid profession.
  - If the attribute belongs to the "Relationships" category and `relatedCharacterCount > 0`:
    - Create $N$ placeholder characters (typically $N=1$).
    - **Relationship Type:** Uses the name of the relationship attribute (e.g., `"Married"`, `"Dating"`, `"Complicated"`).
    - **Propagation Rules:** Randomly selected age within `±5` years. Keep `originLocation` in the same country/state. If the relationship type implies marriage, probabilistically share the last name.
  - Add bidirectional (or unidirectional) `Relationship` entries between the source character and the newly generated placeholders using the determined `type`.

### 3. UI Updates
- **Relationship Display:** Update Character profiles to display the new string-based `RelationshipType` and properly link to other `Character` pages.
- **Entity Editor UI:** Update the attribute creation/editing modal (e.g., `BioEntityEditor` or similar) to allow inputting `relatedCharacterCount` when configuring attributes for siblings or relationships.

## Verification Plan
- **Manual Verification:**
  - Create a "Married" attribute in the Relationships category and set its `relatedCharacterCount` to `1`.
  - Create a "2 Siblings" attribute in the Siblings category and set its `relatedCharacterCount` to `2`.
  - Run the procedural character generator selecting these attributes.
  - Check the output logs / GameStore state to see 4 total characters created (1 main, 1 partner, 2 siblings).
  - Verify that the siblings' relationship type is "sibling" and the partner's is "Married".
  - Verify demographical propagation (last names, ages, origin locations).
