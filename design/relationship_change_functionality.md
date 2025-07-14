# Relationship Update Workflow Design

## 1. Introduction

This document outlines the design for a new workflow to dynamically update the relationship between a character and a player persona based on their chat interactions. After each character response, a background process will assess the impact on the relationship, generate a delta, and update the displayed relationship values cumulatively. An "End Chat" button will be introduced to commit these cumulative changes to the persistent relationship data.

## 2. New API Endpoint: `/api/generate/relationship-delta`

### Purpose
To assess the impact of the latest chat exchange on the character-persona relationship and generate a delta (change) in relationship values.

### Method
`POST`

### Request Body
```json
{
  "character": { /* Character object */ },
  "persona": { /* PlayerPersona object */ },
  "chatHistory": [ /* Array of the whole conversation minus the latest exchange */ ],
  "latestExchange": { /* The last exchange between character and persona */ },
  "currentRelationship": { /* Current Relationship object before this exchange */ }
}
```

### Response Body
A JSON object representing the *delta* of the relationship values. The structure will be identical to the `Relationship` type, but each numerical value will represent the *change* (positive or negative) in that aspect of the relationship. The `description` field will provide a brief explanation of *why* the change occurred.

```json
{
  "closeness": number,          // e.g., 5 (increased by 5) or -3 (decreased by 3)
  "sexual_attraction": number,
  "respect": number,
  "engagement": number,
  "stability": number,
  "description": string         // e.g., "Any reason why the relationship changed"
}
```

### Logic
The API will utilize an LLM call, providing the character's profile, player persona's profile, the relevant chat history, and the current relationship state. The LLM will be prompted to analyze the exchange and determine the change in each relationship metric, along with a concise explanation.

The new endpoint will need to use a new prompt defined in the src/lib/prompts/generatorPrompts.ts file - from there you can reuse the existing relationship JSON structure if needed. 

### Asynchronous Invocation
This API call will be made asynchronously in the background after the character's chat response has been displayed to the user, ensuring no impact on the UI's responsiveness.

## 3. `RelationshipDisplay` Component Enhancements

### New Props
The `RelationshipDisplay` component will be updated to accept an optional `deltaRelationship` prop, which will be of the `Relationship` type (representing the cumulative deltas for the current chat session).
The delta will be displayed using the same layout in the templates/relationship-display.tsx component, which already imlpements the delta display logic.

```typescript
interface RelationshipDisplayProps {
    characterName: string;
    relationship: Relationship; // The base relationship
    cumulativeDeltaRelationship?: Relationship; // Optional: Cumulative deltas for the session
}
```

### Display Logic
The `RelationshipBar` sub-component will be modified to accept and display a `delta` value. The main `RelationshipDisplay` component will display the `relationship` values directly in the bars, without immediately applying the `cumulativeDeltaRelationship`. The `delta` passed to `RelationshipBar` will be the individual delta for that metric from `cumulativeDeltaRelationship`, which can be used for visual indicators of change (e.g., a small arrow or number next to the bar), but not to alter the bar's primary value until committed.

The `description` in `RelationshipDisplay` will show the base relationship's description, and potentially a concatenated list of descriptions from the cumulative deltas, or just the latest delta's description, depending on user feedback during implementation. For now, it will show the base description and the cumulative delta description.

The delta will be displayed using the same layout in the templates/relationship-display.tsx component, which already imlpements the delta display logic.

We will also add a new field above the 'description' section to display the delta description - this will be updated every time there's a new delta.

## 4. State Management (Zustand Store)

### New State
A new state variable, `cumulativeRelationshipDelta`, will be added to the `useParleyStore`. This will be a single `Relationship` object, representing the cumulative deltas for the *current* chat session between the selected character and persona. It will be reset when a new chat session begins.

```typescript
interface ParleyStore {
  // ... existing states
  cumulativeRelationshipDelta?: Relationship; // Optional: Stores cumulative deltas for the current chat session
  updateCumulativeRelationshipDelta: (delta: Relationship) => void;
  clearCumulativeRelationshipDelta: () => void; // Called on new chat
}
```

### Update Logic
After the `/api/generate/relationship-delta` API call returns, the `updateCumulativeRelationshipDelta` action will be dispatched. This action will:
1. Retrieve the existing `cumulativeRelationshipDelta`. If it doesn't exist, initialize it with the new delta.
2. Add the new `delta` values to the existing cumulative deltas (e.g., `closeness += newDelta.closeness`).
3. Update the `cumulativeRelationshipDelta` object in the store.

### Persistence
The `cumulativeRelationshipDelta` will *not* be persisted across browser sessions. It is intended to track changes only for the duration of the active chat session and will be explicitly cleared when `clearChat` is invoked.

## 5. "End Chat" Button

### Placement
A new "End Chat" button will be added to the chat page, likely near the "New Chat" button.

### Functionality
Upon clicking the "End Chat" button:
1. The `cumulativeRelationshipDelta` for the current character-persona pair will be retrieved.
2. These cumulative deltas will be applied to the main `relationships` state in the `useParleyStore`, effectively committing the changes.
3. The `clearChat` action will be called, which will also clear the `cumulativeRelationshipDeltas` for the session and transition back to the chat selection screen.

## 6. High-Level Implementation Steps

1.  **Define `RelationshipDelta` type:** Ensure it aligns with `Relationship` structure.
2.  **Implement `/api/generate/relationship-delta`:** Create the new API route.
3.  **Enhance `RelationshipDisplay` and `RelationshipBar`:** Modify components to accept and display delta values.
4.  **Update Zustand Store:** Add `cumulativeRelationshipDeltas` state and associated actions (`updateCumulativeRelationshipDelta`, `clearCumulativeRelationshipDeltas`).
5.  **Integrate API Call:** In `chat/page.tsx`, after a character response, trigger the asynchronous call to `/api/generate/relationship-delta` and update the store with the returned delta.
6.  **Add "End Chat" Button:** Implement the button and its handler in `chat/page.tsx` to commit changes and reset the session.
7.  **Testing:** Thoroughly test the new workflow, including delta accumulation and commitment.

## 7. Assessment of current implementation
1. New API Endpoint: /api/generate/relationship-delta

    * Implemented: Yes.
        * The file src/app/api/generate/relationship-delta/route.ts exists.
        * It's a POST endpoint.
        * It correctly receives character, persona, chatHistory, and latestExchange from the request body.
        * It finds the currentRelationship.
        * It uses generateRelationshipDeltaPrompt and generateJSON (which implies an LLM call) to get the relationshipDelta.
        * It returns the relationshipDelta in the expected JSON format.
        * The asynchronous invocation is handled by the client-side calling this API in the background.

2. RelationshipDisplay Component Enhancements

* Partially Implemented:
    * The RelationshipDisplay component in src/components/relationship-display.tsx already accepts relationship and
      cumulativeDeltaRelationship as props.
    * The RelationshipBar sub-component also has logic to display a delta value.
    * The templates/relationship-display.tsx also contains similar logic for displaying deltas.
    * Outstanding: The description in RelationshipDisplay needs to be updated to show the base relationship's description
      and the cumulative delta description, as specified in the design. Currently, it only displays
      relationship.description.

3. State Management (Zustand Store)

* Outstanding:
    * The cumulativeRelationshipDeltas state (as a Map<string, Map<string, Relationship>>) is not implemented in
      src/lib/store.ts.
    * The associated actions updateCumulativeRelationshipDelta and clearCumulativeRelationshipDeltas are also not
      implemented.
    * The persistence aspect (not persisting cumulativeRelationshipDeltas) is implicitly handled because the state itself
      doesn't exist yet.

4. "End Chat" Button

* Partially Implemented:
    * An "End Chat" button exists in src/app/chat/page.tsx.
    * Its onClick handler (handleEndChat) calls clearChat().
    * Outstanding: The core functionality of retrieving the cumulativeRelationshipDelta and applying it to the main
      relationships state in the useParleyStore before calling clearChat is not implemented, as the
      cumulativeRelationshipDeltas state itself is missing.

Summary of Outstanding Items:

1. `RelationshipDisplay` Component: Update the description display logic to include the cumulative delta description.
2. Zustand Store (`src/lib/store.ts`):
    * Add cumulativeRelationshipDeltas state.
    * Implement updateCumulativeRelationshipDelta action.
    * Implement clearCumulativeRelationshipDeltas action.
3. "End Chat" Button (`src/app/chat/page.tsx`):
    * Implement the logic to retrieve and apply cumulativeRelationshipDelta to the character's relationships before
      clearing the chat.
    * Integrate the updateCumulativeRelationshipDelta call after the relationship-delta API call in
      src/app/chat/page.tsx.
