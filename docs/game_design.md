# Parley: Game Design Document

## Overview
Parley is a web-based text adventure game designed to provide an immersive and interactive storytelling experience. Built with Next.js and TypeScript, the application leverages modern web technologies to deliver a dynamic narrative where player choices directly influence the unfolding story, character relationships, and world state.

## Key Features

### 1. Engine Driven Chat (Analyst & Judge)
**User Experience (How it works):**
Conversation in Parley goes beyond simple request-response. The "Hybrid Relationship Engine" analyzes every scene (a batch of informational exchange) to determine the underlying subtext and behavioral traits displayed by the player.
1.  **Chat Interaction**: The player chats freely with the character.
2.  **Scene Ending**: When the player elects to "End Chat", the system freezes the conversation.
3.  **Analysis**: The "Analyst" engine reads the recent history to identify the player's behavioral traits (e.g., Flirtatious, Aggressive, Honest) and major events.
4.  **Judgment**: The "Judge" engine compares these traits against the character's preferences (`Ideal Match`) to calculate a precise numeric impact on the relationship.
5.  **Feedback**: The user receives a summary of the scene, including what traits were picked up and how the relationship changed (e.g., "+5 Intimacy due to vulnerability").

**Relevant Code Objects (Code implementation):**
-   **Frontend**: `ChatPage` (`src/app/chat/page.tsx`) handles the "End Chat" flow, triggering the analysis modal (`SceneSummaryModal`).
-   **Analyst Engine**: `AnalyzeScene` in `src/lib/engine/analyst.ts` uses an LLM prompt (`analyst_system`) to extract `aggregate_traits` and `major_events` from the `chatHistory`.
-   **Judge Engine**: `JudgeScene` in `src/lib/engine/judge.ts` takes the analyst report and calculates PRQC deltas.
    -   It uses `SensitivityMatrix` (`src/lib/engine/math.ts`) to weigh the player's traits against the character's `idealMatch` (OCEAN profile).
    -   It uses `RoutingTable` (`src/lib/engine/rules.ts` or `math.ts`) to map specific behaviors to relationship dimensions (e.g., "Dishonesty" lowers "Trust").

### 2. Procedural Character Generation (BioMachine)
**User Experience (How it works):**
Players can generate complex, life-like characters with deep backstories in seconds. Instead of just random text, the system simulates a life path:
1.  **Spine Generation**: The system solves constraints to pick a valid Origin, Education, and Career path that makes logical sense (e.g., a "Noble" origin leads to "Checkered Past" education and "Politician" career).
2.  **Flesh Simulation**: It then simulates 5-year blocks of the character's life, randomly triggering "Life Events" (e.g., "War Injury", "Bankruptcy", "Marriage") that add texture and tags to the character.
3.  **Narrative Synthesis**: Finally, an LLM weaves these structured facts into a cohesive textual biography.

**Relevant Code Objects (Code implementation):**
-   **Generator**: `BioMachine` in `src/lib/generator/BioMachine.ts`.
    -   `solveSpine()`: Constraint solver for Origin -> Education -> Career.
    -   `simulateFlesh()`: Iterative event generation based on age.
-   **Data Sources**: JSON files in `src/lib/generator/data/` (`origins.json`, `careers.json`, etc.) define the nodes and their requirements/tags.
-   **Prompt**: `bio_writer` in `src/lib/store/promptStore.ts` converts the structured `BioState` into natural language.

### 3. Relationship Engine (PRQC & OCEAN)
**User Experience (How it works):**
Relationships are modeled using the **PRQC** model (Patient-Reported Outcomes Measurement Information System - Relationship Quality), evolving along 5 dimensions:
-   **Satisfaction**: Is the character happy with the dynamic?
-   **Commitment**: Are they loyal?
-   **Intimacy**: Do they feel close/vulnerable?
-   **Trust**: Do they believe the player?
-   **Passion**: Is there romantic/physical attraction?

Character compatibility is determined by their **OCEAN** (Big 5) personality profile and their **Ideal Match** profile. A character with high "Openness" might appreciate a player's "Creative" conversational gambits, while a "Conscientious" character might prefer "Orderly" planning.

**Relevant Code Objects (Code implementation):**
-   **Types**: `Relationship` (PRQC values) and `Character` (OCEAN `personality`, `idealMatch` values) in `src/lib/types.ts`.
-   **Math**: `SensitivityMatrix.getMultiplier()` in `src/lib/engine/math.ts` determines the magnitude and direction of impact based on the alignment between Player Behavior and Character Preference.
-   **Visualization**: `RelationshipDisplay` (`src/components/relationship-display.tsx`) renders the 5-bar chart.

### 4. Dynamic Prompt System
**User Experience (How it works):**
The game's AI is highly configurable. The prompts that drive the character's roleplay, the narrator's descriptions, and the analyst's insights are all templated and stored centrally. This allows the game to inject the current state (Relationship Status, World Info, Character Mood) continuously into the AI's context.

**Relevant Code Objects (Code implementation):**
-   **Store**: `PromptStore` (`src/lib/store/promptStore.ts`) manages all system prompts.
-   **Templates**:
    -   `chat_system`: The main driver, injecting `{{relationship}}`, `{{persona}}`, and `{{character}}` data.
    -   `relationship_delta`: (Legacy/Fallback) For per-turn updates.
    -   `analyst_system`: For scene-level analysis.
-   **Configuration**: User prompts are saved to `config/user-prompts.json` (if customized), falling back to hardcoded defaults in code.

### 5. Asset Generation (ComfyUI)
**User Experience (How it works):**
Visuals are generated on-the-fly to match the textual descriptions.
1.  **Description**: The LLM generates a visual prompt based on the character's appearance data.
2.  **Generation**: The system connects to a local **ComfyUI** instance (Stable Diffusion) to render the image.
3.  **Result**: The image is displayed on the character card and saved for future sessions.

**Relevant Code Objects (Code implementation):**
-   **Adapter**: `src/lib/imageWorkflowAdapter.ts` modifies a JSON workflow template (`character_avatar.json`) with the specific prompt and seed.
-   **Client**: `src/lib/comfyui.ts` handles the WebSocket connection and polling of the ComfyUI API (`127.0.0.1:8188`).
-   **Workflows**: Stored in `image_workflows/` directory.

## Technical Architecture

### Tech Stack
-   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.
-   **Backend**: Next.js API Routes.
-   **State Management**: `zustand` with `persist` middleware for local storage.
-   **AI Integration**: Vercel AI SDK (`ai/react`, `ai/rsc`) and direct OpenAI/LangChain calls.

### Data Persistence
All game state is local-first, persisted in the browser's `localStorage` via Zustand:
-   `entity-store`: Characters, Personas, Groups.
-   `parley-storage`: Chat sessions, Global settings (API keys, World Info).

### Project Structure
-   `src/app`: Page routes and API endpoints.
-   `src/components`: UI components (atomic & composite).
-   `src/lib/engine`: Core logic for Analyst, Judge, and Math.
-   `src/lib/generator`: Procedural generation logic (BioMachine).
-   `src/lib/store`: State management definitions.
