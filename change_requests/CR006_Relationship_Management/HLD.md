# HLD: Relationship Management Improvements (CR006)

## 1. Introduction
This Change Request addresses the need for better relationship management between Characters and Player Personas. Currently, relationships are implicitly created or missing, leading to inconsistent behavior. The goal is to allow explicit creation of relationships and handle the "first chat" scenario gracefully.

## 2. Requirements

### 2.1 Manual Relationship Creation
- **UI**: Add a "Create Relationship" button in the `CharacterConfiguration` screen (inside the Relationships accordion or header).
- **Functionality**:
    - Open a dialog to select a Persona (from available existing personas).
    - Provide a text field for "Relationship Background" to describe the history/context.
    - generate the relationship stats and description based on this background using the LLM.

### 2.2 First Chat Handling
- **Logic**: If a chat is initiated (or first message sent) and no relationship exists between the Character and Persona:
    - Automatically create a relationship.
    - Do NOT generate a random background.
    - Set the relationship description to explicitly state: "Character does not know the Persona."
    - Set stats to a neutral baseline (e.g., all 50 or 0).
    - Ensure this "unknown" state is passed to the LLM in the system prompt.

## 3. Proposed Changes

### 3.1 Frontend: `CharacterConfiguration.tsx`
- **Add Button**: Insert a "Create Relationship" button in the Relationships card header (visible when editing).
- **New Dialog**: `CreateRelationshipDialog` (or inline) containing:
    - Persona Select (Combobox/Select).
    - Background Textarea.
- **Action**: On submit, call `/api/generate/relationship` with `character`, `persona`, and `context` (the background).
- **State Update**: Update the character's `relationships` array with the result.

### 3.2 Backend: `/api/generate/relationship` & Prompts
- **Update API**: Accept an optional `relationshipContext` field in the request body.
- **Update Prompt**: Modify `generateRelationshipPrompt` in `src/lib/prompts/generatorPrompts.ts` to include the `relationshipContext` if provided.
    - This allows the LLM to generate stats (Love/Hate/etc.) based on the user's description.

### 3.3 Frontend: `ChatComponent.tsx`
- **Initialization Check**: When mounting or switching characters:
    - Check if `selectedChatCharacter` has a relationship with `selectedChatPersona`.
- **Auto-Creation**:
    - If missing, generate a default relationship object:
        ```typescript
        const defaultRelationship: Relationship = {
            characterId: character.id,
            personaId: persona.id,
            satisfaction: 50,
            commitment: 50,
            intimacy: 50,
            trust: 50,
            passion: 50,
            description: "The Character does not know the Persona.",
            chat_summaries: []
        };
        ```
    - Dispatch an update to the `entityStore` to save this relationship effectively "creating" it.
    - Pass this relationship to the chat logic so the prompt generation sees it.

## 4. Data Flow

### Manual Creation
1. User clicks "Add Relationship".
2. User selects Persona "Bob" and enters "Childhood rivals".
3. Frontend POSTs to `/api/generate/relationship` with context "Childhood rivals".
4. LLM generates PRQC stats (e.g., High Intimacy, Low Trust) and description.
5. Frontend adds new Relationship object to Character.

### First Chat (Auto)
1. User selects Character "Alice" and Persona "Charlie".
2. `ChatComponent` detects no relationship in `Alice.relationships`.
3. `ChatComponent` creates default "Unknown" relationship.
4. `ChatComponent` updates "Alice" in store.
5. Chat starts; System Prompt receives the "Unknown" relationship description.
