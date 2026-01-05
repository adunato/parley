# CR005: Character Generation Enhancements

## 1. Overview
Enhance the character generation process by integrating a "Bi-Directional Procedural Character Bio Generator" and realistic data generation using `faker`. This also involves retrofitting the existing character generation pipeline to be "Context-Aware", allowing it to complete partially filled character sheets (e.g., those started by the procedural generator) rather than overwriting them.

## 2. System Architecture

The solution will be implemented as a standalone service layer that the front-end components consume.

### 2.1 The Bio Generator Engine ("BioMachine")
A standalone TypeScript service implementing the 3-layer architecture defined in the specialized HLD.
*   **Layer 1: The Spine (Logic)**: A Constraint Satisfaction Engine to determine the valid life path.
*   **Layer 2: The Flesh (Simulation)**: A probabilistic event simulator.
*   **Layer 3: The Skin (Narrative)**: An LLM prompt interface ("Bio Writer").

### 2.2 The Data Generator (Faker Wrapper)
A lightweight utility service wrapping `faker` to provide locale-specific data.
*   **Inputs**: Country, Gender (optional)
*   **Outputs**: Identity object (Name, Location, Country, Gender).

## 3. Data Structures

### 3.1 Bio Engine Data (JSON)
*   **Nodes**: `EventNode` (Origin, Education, Career).
*   **Bi-Directional Request**:
    ```typescript
    interface BioGenerationRequest {
      targetCareer?: string;
      targetOrigin?: string;
      age?: number;
    }
    ```

## 4. Implementation Plan

### Phases 1-3 (Completed)
*   Foundation, Faker Service, and BioMachine Logic are implemented.

### Phase 4: Procedural Bio Generator Integration
1.  **Prompt Management**: Register `bio_writer` in `PromptStore`.
2.  **API**: Create `src/app/api/generate/bio/route.ts`.
3.  **UI Update**: Modify `character-configuration.tsx` to add `ProceduralGeneratorDialog`.

### Phase 5: Verification
1.  Unit tests for `BioMachine` logic.
2.  End-to-end test of UI generation flow.

### Phase 6: Retrofitting Existing Generators (Context-Awareness) (Detailed)

This phase ensures that the main "Generate Character" flow honors the data created by the Procedural Bio Generator.

#### 6.1 Data Payload Changes
**File**: `src/app/api/generate/character/route.ts`

**Current Payload**:
```typescript
{ characterDescription, worldDescription, aiStyle, generationModel }
```

**New Payload**:
```typescript
{
  characterDescription?: string;
  worldDescription?: string;
  aiStyle?: string;
  generationModel?: string;
  existingContext?: {  // <--- NEW OPTIONAL PARAMETER
    name?: string;
    role?: string;
    background?: string;
    gender?: string;
  }
}
```

**Modification Logic**:
*   The API route extracts `existingContext`.
*   Passes `existingContext` to `generateCharacterPrompt`.

#### 6.2 Prompt Generator Logic Update
**File**: `src/lib/prompts/generatorPrompts.ts`

**Function**: `generateCharacterPrompt`

**Changes**:
*   Update signature: `(characterDescription: string, worldDescription: string, aiStyle: string, existingContext?: CharacterContext)`
*   Logic:
    *   If `existingContext` is present, format it into a string block:
        ```text
        --- EXISTING CONTEXT ---
        Name: [name]
        Role: [role]
        Background: [background]
        ...
        ------------------------
        ```
    *   Inject this block into the `character_gen` template via the new `{{existingContext}}` variable.

#### 6.3 Prompt Store Update
**File**: `src/lib/store/promptStore.ts`

**Prompt ID**: `character_gen`

**Current Template**:
```text
... {{characterDescription}} ...
```

**New Template**:
```text
You are a character-building AI...
{{jsonStructure}}

Generate a detailed character profile.

{{existingContext}}  <-- NEW VARIABLE

{{characterDescription}}

{{worldDescription}}

{{aiStyle}}

JSON Output:
```

**Instruction Update (Implicit in Template or Variable)**:
The `{{existingContext}}` variable injection logic in `generatorPrompts.ts` will include the instruction: *"The user has already defined the following attributes. Use them as the immutable foundation for the character and generate the remaining JSON fields to match/complement them."*

#### 6.4 Frontend Logic Update
**File**: `src/components/character-configuration.tsx`

**Function**: `generateCharacter(prompt: string)`

**Changes**:
1.  Check `displayCharacter` state.
2.  Construct `existingContext` object:
    ```typescript
    const existingContext = {};
    if (displayCharacter.basicInfo.name !== "New Character") existingContext.name = ...;
    if (displayCharacter.basicInfo.background) existingContext.background = ...;
    // ... logic to avoid sending empty/default values
    ```
3.  Include `existingContext` in the `fetch` body.

## 5. Detailed Integration & UI Workflow (Phase 4 Refinement)

### 5.1 Procedural Generator Dialog
*   **Trigger**: Magic Wand icon in Basic Info section.
*   **Dialog**: `ProceduralGeneratorDialog`.
    *   **Data Generation**: Local logic calls `BioMachine` -> `POST /api/generate/bio`.
    *   **Apply**: Updates local character state (Name, Background, etc.).

### 5.2 LLM Interface for Bio
**New Prompt**: `bio_writer` (Registered in `PromptStore`).
**Template**: defined in previous HLD, specific for converting Spine/Flesh to text.
**API**: `POST /api/generate/bio`.
