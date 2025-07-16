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