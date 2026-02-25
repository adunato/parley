# Parley: Game Design Document

## Overview
Parley is a web-based text adventure game designed to provide an immersive and interactive storytelling experience. Built with Next.js and TypeScript, the application leverages modern web technologies to deliver a dynamic narrative where player choices directly influence the unfolding story, character relationships, and world state.

## Key Features

### 1. Engine Driven Chat (Analyst & Judge)
**User Experience (How it works):**
Conversation in Parley goes beyond simple request-response. The "Hybrid Relationship Engine" analyzes every scene (a batch of informational exchange) to determine the underlying subtext and behavioral traits displayed by the player.
1.  **Chat Interaction**: The player chats freely with the character.
2.  **Scene Ending**: When the player elects to "End Chat", the system freezes the conversation.
3.  **Analysis (The Analyst)**: The "Analyst" engine reads the recent history to identify:
    -   **Aggregate Traits**: How the player is behaving (e.g., "Flirtatious", "Aggressive", "Honest").
    -   **Major Events**: Key plot points or revelations.
4.  **Judgment (The Judge)**: The "Judge" engine compares these traits against the character's preferences (`Ideal Match`) to calculate a precise numeric impact on the relationship.
    -   **Sensitivity Matrix**: Compares the player's behavior against the character's `Ideal Match` profile. Behavior aligning with preferences yields positive multipliers; opposing behavior yields negative ones.
    -   **Routing Table**: Maps behavioral traits (like "Openness") to specific Relationship metrics (like "Intimacy").
    -   **Delta Calculation**: Updates the PRQC values based on the calculated impact.
5.  **Feedback**: The user receives a summary of the scene, including what traits were picked up and how the relationship changed (e.g., "+5 Intimacy due to vulnerability").

**Relevant Code Objects (Code implementation):**
-   **Frontend**: `ChatPage` (`src/app/chat/page.tsx`) handles the "End Chat" flow, triggering the analysis modal (`SceneSummaryModal`).
-   **Analyst Engine**: `AnalyzeScene` in `src/lib/engine/analyst.ts` uses an LLM prompt (`analyst_system`) to extract `aggregate_traits` and `major_events` from the `chatHistory`.
-   **Judge Engine**: `JudgeScene` in `src/lib/engine/judge.ts` takes the analyst report and calculates PRQC deltas.
    -   It uses `SensitivityMatrix` (`src/lib/engine/math.ts`) to weigh the player's traits against the character's `idealMatch` (OCEAN profile).
    -   It uses `RoutingTable` (`src/lib/engine/rules.ts` or `math.ts`) to map specific behaviors to relationship dimensions (e.g., "Dishonesty" lowers "Trust").

### 2. Procedural Character Generation (BioMachine)
**User Experience (How it works):**
Players can generate complex, life-like characters with deep backstories in seconds. Instead of just random text, the system simulates a life path divided into **Age Phases** (Childhood, Formative, Professional, Senior):
1.  **Phased Loop**: The system iterates chronologically through each age phase.
2.  **Interleaved Selection**: Within each phase, it resolves the major life milestone ("The Spine") and then simulates probabilistic "Life Events" ("The Flesh") for that specific age range.
    -   **Childhood (0-18)**: Sets the origin/background spine node.
    -   **Formative (18-25)**: Sets the education/training spine node.
    -   **Professional (25-65)**: Sets the career/role spine node.
    -   **Senior (65+)**: Sets late-life status spine node.
3.  **Logical Continuity**: Tags gathered early in life (e.g., "Childhood Trauma") influence and unlock paths in later phases (e.g., "Medical School" or "Special Ops Career").
4.  **Narrative Synthesis**: Finally, an LLM weaves these structured facts into a cohesive textual biography.
5.  **LLM-Powered Configuration**: Creators can use the "Gen Events" tool in the Configuration UI to procedurally expand the "World Bible" by generating new Spine Nodes and Life Events tailored to specific phases or connected to existing items.

**Relevant Code Objects (Code implementation):**
-   **Generator**: `BioMachine` in `src/lib/generator/BioMachine.ts`.
    -   `generate()`: Executes the interleaved phase loop.
    -   `resolvePhaseSpine()`: Resolves milestones for a specific phase (Childhood, Formative, Professional, Senior).
    -   `simulatePhaseFlesh()`: Simulates probabilistic events for a phase range.
-   **Data Generation**: 
    - `generateLifeEvents` in `src/lib/generator/lifeEventGenerator.ts`.
    - `generateSpineEvents` in `src/lib/generator/spineEventGenerator.ts`.
    - UI: `GenerateEventsDialog` in `src/components/bio-config/generate-events-dialog.tsx`.
-   **Configuration**: `useBioStore` manages global phase boundaries and event probabilities.
-   **Data Sources**: JSON files in `src/lib/generator/data/` define the nodes, requirements, and assigned phases.
-   **Prompt**: `bio_writer` in `src/lib/store/promptStore.ts` converts the structured `BioState` into natural language.

> **Detailed Design**: See [High-Level Design: Procedural Character Bio Generator](./High-Level%20Design_%20Procedural%20Character%20Bio%20Generator.md) for full architecture.

### 3. Relationship & Personality Engine
**User Experience (How it works):**
Relationships in Parley are deep and evolving, modeled using two primary psychological frameworks: **OCEAN** for personality and **PRQC** for relationship quality.

#### Personality System (OCEAN)
Characters are defined by the Big Five personality traits, influencing their behavior and AI instructions:
-   **Openness:** Preference for novelty vs. routine. High scorers are abstract and curious; low scorers are concrete and traditional.
-   **Conscientiousness:** Discipline vs. spontaneity. High scorers are precise and organized; low scorers are relaxed and messy.
-   **Extraversion:** Social stimulation needs. High scorers initiate and drive conversation; low scorers are reactive and reserved.
-   **Agreeableness:** Cooperation vs. conflict. High scorers prioritize harmony; low scorers prioritize truth or self-interest.
-   **Neuroticism:** Emotional stability. High scorers are anxious and reactive to stress; low scorers are calm and unflappable.

#### Relationship System (PRQC)
Relationships evolve along 5 dimensions (Patient-Reported Outcomes Measurement Information System - Relationship Quality):
-   **Satisfaction:** Is the character happy with the dynamic? (High: "The Warm Glow" vs Low: "The Cold Shoulder")
-   **Commitment:** Are they loyal? (High: "We" language vs Low: "I" language)
-   **Intimacy:** Do they feel close/vulnerable? (High: "The Open Book" vs Low: "The Wall")
-   **Trust:** Do they believe the player? (High: "The Believer" vs Low: "The Skeptic")
-   **Passion:** Is there romantic/physical attraction? (High: "The Magnet" vs Low: "The Platonic Zone")

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

### 5. World & Exploration
**User Experience (How it works):**
The world is navigated through a visual map and detailed location cards.
1.  **World Map**: A graphical interface (`/files/map.html` rendered in an iframe) allows players to select locations. Use "Instant Save" to persist changes immediately.
2.  **Locations**: dedicated `/locations` page allows management of game settings.
3.  **Navigation**: Players can move between the Map, Chat, and Settings via the new "Gameplay Toolbar" overlay.

**Relevant Code Objects (Code implementation):**
-   **Page**: `src/app/locations/page.tsx` for location management.
-   **Map**: `src/app/map/page.tsx` (or similar) hosting the map visualization.
-   **Toolbar**: `src/components/gameplay-toolbar.tsx` provides persistent navigation during active play.

### 6. Immersive UI
**User Experience (How it works):**
The interface enhances immersion through dynamic elements:
-   **Day/Weather System**: Tracks in-game time and weather conditions, displayed via the `DayWeatherDisplay` component.
-   **Theme Selection**: Users can toggle between "Light", "Dark", and "High Contrast" themes in Settings.
-   **Gameplay Toolbar**: A persistent HUD showing the current persona, time/weather, and quick actions.

**Relevant Code Objects (Code implementation):**
-   **Weather**: `DayWeatherDisplay` in `src/components/ui/day-weather-display.tsx`.
-   **Themes**: Managed via `ThemeProvider` and `GeneralSettings` (`src/app/settings/general/general-settings.tsx`).

### 7. Asset Generation (ComfyUI)
**User Experience (How it works):**
Visuals are generated on-the-fly to match the textual descriptions.
1.  **Description**: The LLM generates a visual prompt based on the character's appearance data.
2.  **Generation**: The system connects to a local **ComfyUI** instance (Stable Diffusion) to render the image.
3.  **Result**: The image is displayed on the character card and saved for future sessions.

**Relevant Code Objects (Code implementation):**
-   **Adapter**: `src/lib/imageWorkflowAdapter.ts` modifies a JSON workflow template (`character_avatar.json`) with the specific prompt and seed.
-   **Client**: `src/lib/comfyui.ts` handles the WebSocket connection and polling of the ComfyUI API (`127.0.0.1:8188`).

### 8. Game Session Management
**User Experience (How it works):**
Parley distinguishes between "World Configuration" (editing characters/locations) and "Active Game" (playing a session).
-   **New Game**: Clones the current World Configuration into a fresh Game State.
-   **Resume**: Loads the active Game State.
-   **Save**: Game state is autosaved to specific slots (or "Instant Save" for config).

**Relevant Code Objects (Code implementation):**
-   **Stores**: Split between `EntityStore` (Configuration) and `GameStore` (Runtime).
-   **Logic**: `GameStore` initializes by deep-cloning `EntityStore` data to ensure the base configuration remains pristine while the game state evolves.

### 9. Character Grouping
**User Experience (How it works):**
Characters can be organized into custom groups (e.g., "Merchants", "Enemies"). This allows players to manage large casts of characters more effectively. A character can belong to multiple groups, offering flexible organization.

**Relevant Code Objects (Code implementation):**
-   **Data Structure:** Defined as `CharacterGroup` in `src/lib/types.ts`, containing an `id`, `name`, and a list of `characterIds`.
-   **State Management:** `useEntityStore` includes actions like `addCharacterGroup` and `updateCharacterGroup` to manage these associations.

## Game Entities

### 1. Character
The primary NPC entity in the game. Characters are fully realized individuals with unique personalities and backgrounds.
- **Basic Info:** Name, age, gender, role, reputation, background, first impression, appearance, and origin location.
- **Personality (OCEAN):** A set of 5 traits defining their behavior (see *Personality System*).
- **Ideal Match:** A personality profile representing who they are most compatible with or attracted to.
- **Relationships:** A list of relationships with other entities (see *Relationship System*).
- **Location:** The current location ID where the character resides.
- **Generation Metadata:** Information about how the character was procedurally generated.

### 2. Player Persona
The representation of the user in the game world. This allows the player to roleplay different identities in different sessions.
- **Basic Info:** Name, age, gender, role, reputation, background, first impression, and appearance.
- **Function:** Acts as the "Player" context in LLM prompts, ensuring NPCs react appropriately to the player's assumed identity (e.g., treating a Noble with respect vs. a Rogue with suspicion).

### 3. Relationship
Defines the connection between a Character and a Player Persona (or potentially other Characters).
- **Metrics (PRQC):** A set of 5 dynamic values (0-100) tracking the state of the bond.
- **Description:** A text summary of the relationship dynamic.
- **Chat Summaries:** History of key interactions.

### 4. Location
A physical space in the game world where interactions occur.
- **Attributes:** Name, description, image, and 2D map coordinates.
- **Profession Slots:** Designated spots for characters with specific professions to populate the location (e.g., a "Bartender" slot in a "Tavern").

### 5. Character Group
A user-defined collection of characters for organizational purposes (e.g., "Guild Members", "Family").
- **Structure:** ID, name, description, and a list of character IDs.

### 6. Game Attributes & Professions
Generic and specific traits that can be assigned to entities to define their socio-economic or functional background.
- **GameAttributeCategory:** Groups attributes (e.g., "Education", "Origins", "Housing").
- **GameAttribute:** A specific trait within a category.
- **Profession:** A specialized attribute that may have age constraints (`minAge`, `maxAge`) and defines a character's job or role.

### 7. Bio Generator Entities
Entities used by the procedural background generation system ("Bio Machine").
- **Spine Node:** Represents a major life milestone or phase (e.g., "University", "Apprenticeship").
- **Life Event:** A specific event that occurs within a spine node or as a consequence of another event.
- **Tags:** Keywords used to link events logically (e.g., an event might *provide* the "wealthy" tag, which is *required* by a subsequent event).

## Technical Architecture

### Tech Stack
-   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.
-   **Backend**: Next.js API Routes.
-   **State Management**: `zustand` with `persist` middleware (using Dexie adapter).
-   **AI Integration**: Vercel AI SDK (`ai/react`, `ai/rsc`) and direct OpenAI/LangChain calls.

### Data Persistence
All game state is **Local-First**, persisted in the browser's **IndexedDB** via `Dexie.js`:
-   **Dexie Database**: `ParleyDatabase` defined in `src/lib/db.ts`.
-   **Zustand Middleware**: Custom `SexieStorageAdapter` (or similar) connects Zustand stores to Dexie tables.
-   **Migration**: Legacy `localStorage` data is automatically migrated to IndexedDB on startup.

### State Management Strategy
We use a dual-store architecture to separate Configuration from Gameplay:
1.  **EntityStore**: Manages the "World Bible" (Characters, Locations, Prompts). Changes here affect *future* games.
2.  **GameStore**: Manages the "Active Session". It includes a snapshot of characters/locations plus runtime state (Chat History, Relationships).
3.  **ParleyStore**: Global app settings (API Keys, Theme, UI State).

### Data Flow Examples

#### 1. Chat Interaction
1.  **User Input:** User types a message in `ChatComponent`.
2.  **State Update:** `useParleyStore`/`GameStore` updates `chatInput`.
3.  **Submission:** `useChat.handleSubmit` is triggered.
4.  **API Call:** A POST request is sent to `/api/chat` with history, current input, and context.
5.  **Processing:** The server constructs the prompt with world/character context and queries the LLM.
6.  **Streaming:** The LLM response is streamed back to the frontend.
7.  **Update:** `ChatComponent` updates the message list in real-time.
8.  **Persistence:** The new message history is saved to the store (and thus `IndexedDB`).

#### 2. Character Generation
1.  **User Request:** User opens "Generate Character" dialog and enters a prompt.
2.  **API Call:** Frontend calls `/api/generate/character` with the prompt.
3.  **LLM Generation:** Server asks LLM to return a JSON object representing the character.
4.  **Integration:** The JSON response is received by the frontend.
5.  **Store Action:** `useEntityStore.addCharacter` is called.
6.  **Persistence:** The updated character list is serialized to `IndexedDB`.

#### 3. Asset Generation (Avatar)
1.  **Trigger:** User clicks "Generate Avatar" for a character.
2.  **Description Gen:** API call to `/api/generate/avatar-description` to get a visual prompt.
3.  **Image Gen:** API call to `/api/generate/avatar-image` with the visual prompt.
4.  **Upload:** Use internal upload API or cloud storage to save the image (if applicable) or use the returned URL/Base64.
5.  **Update:** The character's `avatar` field is updated in `useEntityStore` and serialized to `IndexedDB`.

### Project Structure
-   `src/app`: Page routes and API endpoints.
-   `src/components`: UI components (atomic & composite).
-   `src/lib/engine`: Core logic for Analyst, Judge, and Math.
-   `src/lib/generator`: Procedural generation logic (BioMachine).
-   `src/lib/store`: State management definitions (`gameStore`, `projectStore`, `promptStore`).
-   `src/lib/db.ts`: Dexie database definition.
-   `src/stories`: Storybook documentation.
