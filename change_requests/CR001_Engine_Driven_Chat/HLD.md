# High Level Design: Engine Driven Chat (CR001)

## Overview
The current chat system reacts directly to user input via an LLM, determining relationships and responses in a single opaque pass. This change request proposes a shift to a structured, **Engine-Driven Pipeline** powered by LangGraph.

The new flow introduces a multi-stage process:
1.  **Classification**: The user's message is first analyzed by an LLM to assign predefined semantic tags.
2.  **Deterministic Reaction**: A code-based engine uses these tags, along with current game state and character personality, to deterministically calculate the character's internal reaction and intended behavioral tone.
3.  **Response Generation**: Finally, the LLM generates the dialogue response, constrained by the specific reaction parameters and context provided by the engine.

This hybrid approach combines the creativity of LLMs with the consistency and game-design control of a deterministic rule system.

## Goals
-   **Structured Pipeline**: Implement a LangGraph backend to orchestrate the chat flow.
-   **Input Classification**: Utilize LLMs to strictly classify user intent into predefined tags.
-   **Deterministic State**: Move character reaction logic (relationship changes, mood shifts) out of the LLM and into deterministic code algorithms.
-   **Controlled Generation**: Ensure LLM responses adhere to the specific emotional and behavioral constraints calculated by the engine.

## Use Case Flow
1.  **User Input**: User sends a text message.
2.  **Classification (LLM)**:
    *   Input: User message, Context (Brief).
    *   Output: A set of Tags (e.g., `[AGGRESSIVE, QUESTION]`).
3.  **Reaction Assessment (Engine/Code)**:
    *   Input: Tags, Character Personality, Current Relationship Score.
    *   Logic: `calculate_reaction(tags, personality, state)`.
    *   Output: Reaction Parameters (e.g., `Mood: Hostile`, `RelationshipDelta: -5`).
4.  **Response Generation (LLM)**:
    *   Input: User message, Reaction Parameters, Dialogue History.
    *   Output: Character dialogue that embodies the calculated mood.
5.  **State Update**: Apply `RelationshipDelta` to the database.

## Architecture
(Placeholder)

## Data Models
(Placeholder)

## API Changes
(Placeholder)