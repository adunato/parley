# CHAT SESSION SUMMARISATION

## OBJECTIVE

After the user presses "End Chat", the chat session should be summarised and stored in the store in the Relationship object under the "chat_summaries" new field. For future implementation, the chat summary should be a new object ChatSummary which will only contain a summary and a timestamp.

## REQUIREMENTS

- The chat session should be summarised and stored in the store in the Relationship object under the "chat_summaries" new field which will be an array of ChatSummary objects.
- The chat summary should be a new object ChatSummary which will only contain a summary and a timestamp.
- The chat summaries should be displayed on the Character page as an expandable section.
- The chat summaries should be displayed in the chat page, relationship card, as an expandable section.
- The chat summaries should be ordered by timestamp (most recent first).

## IMPLEMENTATION STEPS

1.  **Data Model:**
    *   Define a new `ChatSummary` interface with `summary: string` and `timestamp: Date` fields.
    *   Update the `Relationship` interface to include a `chat_summaries: ChatSummary[]` field.

2.  **Backend:**
    *   Create a new API route at `src/app/api/summarise/route.ts`.
    *   This route will accept a POST request containing the chat history.
    *   It will use an LLM to generate a summary of the chat history - the prompt will be defined in `src/lib/prompts/generatorPrompts.ts`.
    *   It will return the generated summary.

3.  **Frontend:**
    *   **Chat Page:**
        *   When the "End Chat" button is clicked, send the chat history to the `/api/summarise` endpoint.
        *   Store the returned summary and the current timestamp in the `Relationship` object in the application's state.
    *   **Character Page:**
        *   Create a new component to display the chat summaries.
        *   This component will render an expandable section with the list of summaries, ordered by timestamp (most recent first).
    *   **Chat Page (Relationship Card):**
        *   Reuse the summary display component to show the summaries in an expandable section on the relationship card.