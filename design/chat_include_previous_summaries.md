# Design: Injecting Previous Chat Summaries into the Prompt

**Author**: Gemini
**Date**: 2025-07-17
**Status**: Proposed

## 1. Objective

To provide the AI with historical context by injecting a series of summaries from previous conversations into the system prompt. This will enable the AI to maintain continuity and awareness of the evolving narrative and relationship between the player and the character.

## 2. Background

The application already stores chat summaries from past conversations. The data is located within the `character` object at `character.relationships.chat_summaries`. This array contains a list of strings, where each string is a summary of a past chat session.

The scope of this task is to correctly pass this existing data to the prompt generation logic and format it for the AI.

## 3. High-Level Design

The implementation will be focused on modifying the backend API and the prompt generation logic. The frontend does not require changes, as the `character` object containing the summaries is already being passed to the API.

1.  **API Route (`api/chat/route.ts`)**: Extract the `chat_summaries` from the `relationship` object.
2.  **Prompt Generation (`lib/prompts/chatPrompts.ts`)**: Pass the summaries to the `generateSystemPrompt` function.
3.  **System Prompt Update**: The `generateSystemPrompt` function will be updated to accept the array of summaries and format them into a new section within the prompt.

## 4. Detailed Component Changes

### 4.1. API Route: `src/app/api/chat/route.ts`

No changes are needed to the request body received from the client. The `character` object, which contains the `relationships` and nested `chat_summaries`, is already available.

The `POST` handler will extract the `chat_summaries` from the `relationship` object and pass it to the prompt generation function.

**Current Logic:**
```typescript
// src/app/api/chat/route.ts

export async function POST(req: Request) {
  const { messages, character, persona, worldDescription, aiStyle } = await req.json();
  const relationship = character.relationships.find((rel: any) => rel.personaAlias === persona.alias);

  // ...

  const finalSystemPrompt = generateSystemPrompt(character, persona, relationship, worldDescription, aiStyle);

  // ...
}
```

**Proposed Change:**
```typescript
// src/app/api/chat/route.ts

export async function POST(req: Request) {
  const { messages, character, persona, worldDescription, aiStyle } = await req.json();
  const relationship = character.relationships.find((rel: any) => rel.personaAlias === persona.alias);
  const chatSummaries = relationship?.chat_summaries; // Extract summaries

  // ...

  const finalSystemPrompt = generateSystemPrompt(character, persona, relationship, worldDescription, aiStyle, chatSummaries); // Pass summaries to prompt generator

  // ...
}
```

### 4.2. Prompt Generation: `src/lib/prompts/chatPrompts.ts`

The `generateSystemPrompt` function will be modified to accept an optional array of strings (`chatSummaries`). If the array is present and not empty, it will be formatted and inserted into the system prompt.

**Proposed Change:**
```typescript
// src/lib/prompts/chatPrompts.ts

export const generateSystemPrompt = (
    character: Character,
    playerPersona: PlayerPersona,
    relationship: Relationship,
    worldDescription?: string,
    aiStyle?: string,
    chatSummaries?: string[] // New parameter
) => {
    // ... existing prompt generation for character, persona, etc.

    let prompt = `...`; // Existing prompt structure

    if (chatSummaries && chatSummaries.length > 0) {
        const summariesText = chatSummaries.map((summary, index) => `- ${summary}`).join('\n');
        prompt += `
--- PREVIOUS CONVERSATION SUMMARIES ---
This is a summary of your past conversations with ${playerPersona.name}. Use it to recall past events and maintain conversational continuity.
${summariesText}
-----------------------------------------
`;
    }

    // ... rest of the prompt
    prompt += `Interpret the JSON as follows...`;

    return prompt;
};
```

## 5. Data Flow

1.  The frontend sends the `character` object (including `relationships` and `chat_summaries`) to the `/api/chat` endpoint.
2.  The API route extracts the `chat_summaries` array from the `relationship` object.
3.  The `chat_summaries` array is passed as an argument to `generateSystemPrompt`.
4.  `generateSystemPrompt` formats the summaries into a dedicated section within the system prompt.
5.  The complete prompt, now containing historical context, is sent to the language model.

This design correctly utilizes the existing data structure and requires minimal, targeted changes to the backend logic.
