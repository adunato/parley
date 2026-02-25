# Parley: Game Design Document

## Overview
Parley is a web-based text adventure game designed to provide an immersive and interactive storytelling experience. Built with Next.js and TypeScript, the application leverages modern web technologies to deliver a dynamic narrative where player choices directly influence the unfolding story.

## Key Design Principles

### 1. Choice-Driven Narrative
**User Experience (How it works):**
The core of Parley's design revolves around player agency. The game presents users with a chat interface where they can interact with characters, make decisions, and drive the story forward. The narrative adapts to these inputs, maintaining context of the world and character relationships.

**Relevant Code Objects (Code implementation):**
- **Frontend:** `ChatComponent` (`src/components/chat-component.tsx`) renders the chat interface and manages message history display. It utilizes the `useChat` hook from the Vercel AI SDK to handle streaming responses and input state.
- **Backend:** The API route at `src/app/api/chat/route.ts` processes user messages. It constructs the prompt context using world descriptions, character profiles, and relationship data before sending it to the LLM.
- **State:** `useParleyStore` (`src/lib/store.ts`) holds the active chat session data, including `chatMessages`, `chatInput`, and configuration like `worldDescription` and `aiStyle`.

### 2. Dynamic Content Generation
**User Experience (How it works):**
To enhance the adventure, Parley incorporates AI-powered content generation. Users can create new characters or personas by providing a short description or prompt. The system then generates full profiles including personality traits (OCEAN model), backgrounds, and even visual avatars.

**Relevant Code Objects (Code implementation):**
- **Frontend UI:** `CharacterConfiguration` (`src/components/character-configuration.tsx`) provides the interface for creating and editing characters. It includes dialog option to input prompts for generation.
- **Backend Generation:**
    - `src/app/api/generate/character/route.ts`: Generates text attributes (personality, history, role) based on a user prompt.
    - `src/app/api/generate/avatar-description/route.ts`: Creates a detailed visual description of the character suitable for image generation.
    - `src/app/api/generate/avatar-image/route.ts`: Connects to an image generation provider (e.g., ComfyUI or external API) to produce the character portrait.
- **Data Integration:** The generated JSON data is returned to the frontend and merged into the `Character` object structure defined in `src/lib/types.ts`.

### 3. Intuitive User Interface
**User Experience (How it works):**
The game features a clean and responsive web interface using a card-based layout. Users can easily navigate between the Chat, Character Configuration, and World Info sections. The UI includes visual feedback for loading states and specialized displays for complex data like character statistics and relationship meters.

**Relevant Code Objects (Code implementation):**
- **Component Library:** The implementation heavily relies on `shadcn/ui` components (built on Radix UI and Tailwind CSS) located in `src/components/ui`. Examples include `Card`, `Button`, `Dialog`, and `Accordion`.
- **Custom Components:**
    - `RelationshipDisplay` (`src/components/relationship-display.tsx`): Visualizes relationship metrics (closeness, respect, etc.) using progress bars.
    - `CharacterTraitsDisplay` (`src/components/character-traits-display.tsx`): Visualizes personality traits.

### 4. Persistent Data Management
**User Experience (How it works):**
Player progress, created characters, personas, and character groups are persistent. When a user creates a character or edits a relationship, these changes are saved automatically so they are available in future sessions. The system allows for overwriting existing records to refine them.

**Relevant Code Objects (Code implementation):**
- **Stores:**
    - `useEntityStore` (`src/lib/entityStore.ts`) manages the collection of `characters`, `playerPersonas`, and `characterGroups`.
    - `useParleyStore` (`src/lib/store.ts`) manages global game settings and active session state.
- **Persistence Mechanism:** Both stores use the `persist` middleware from `zustand/middleware`, which serializes the state to the browser's `localStorage` under keys `entity-store` and `parley-storage`.

### 5. Character Grouping
**User Experience (How it works):**
Characters can be organized into custom groups (e.g., "Merchants", "Enemies"). This allows players to manage large casts of characters more effectively. A character can belong to multiple groups, offering flexible organization.

**Relevant Code Objects (Code implementation):**
- **Data Structure:** Defined as `CharacterGroup` in `src/lib/types.ts`, containing an `id`, `name`, and a list of `characterIds`.
- **State Management:** `useEntityStore` includes actions like `addCharacterGroup` and `updateCharacterGroup` to manage these associations.
- **UI:** The character configuration screen likely uses checkbox or multi-select mechanisms to assign characters to groups based on the `characterGroups` array in the store.

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
- **Metrics (PRQC):** A set of 5 dynamic values (0-100) tracking the state of the bond:
    - **Satisfaction:** Happiness with the relationship.
    - **Commitment:** Likelihood to maintain the relationship.
    - **Intimacy:** Depth of emotional connection and sharing.
    - **Trust:** Belief in the partner's reliability and honesty.
    - **Passion:** Physical or romantic attraction (or intensity of feeling).
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

## Core Mechanics

### 1. Interaction Engine
The core loop of the game involves a continuous cycle of user input, AI analysis, and response generation.
1.  **Input:** User sends a message via the Chat Interface.
2.  **Analysis (The Analyst):** The `Analyst` engine (`src/lib/engine/analyst.ts`) reads the recent chat history and extracts:
    -   **Aggregate Traits:** How the player is behaving (e.g., "Flirtatious", "Aggressive").
    -   **Major Events:** Key plot points or revelations.
3.  **Judgment (The Judge):** The `Judge` engine (`src/lib/engine/judge.ts`) calculates the impact of the analysis on the relationship:
    -   **Sensitivity Matrix:** Compares the player's behavior against the character's `Ideal Match` profile. Behavior aligning with preferences yields positive multipliers; opposing behavior yields negative ones.
    -   **Routing Table:** Maps behavioral traits (like "Openness") to specific Relationship metrics (like "Intimacy").
    -   **Delta Calculation:** Updates the PRQC values based on the calculated impact.
4.  **Response:** The LLM generates a character response, informed by the updated relationship state and specific acting instructions.

### 2. Personality System (OCEAN)
Characters are defined by the Big Five personality traits, influencing their AI instructions (`src/lib/engine/rules.ts`):
-   **Openness:** Preference for novelty vs. routine. High scorers are abstract and curious; low scorers are concrete and traditional.
-   **Conscientiousness:** Discipline vs. spontaneity. High scorers are precise and organized; low scorers are relaxed and messy.
-   **Extraversion:** Social stimulation needs. High scorers initiate and drive conversation; low scorers are reactive and reserved.
-   **Agreeableness:** Cooperation vs. conflict. High scorers prioritize harmony; low scorers prioritize truth or self-interest.
-   **Neuroticism:** Emotional stability. High scorers are anxious and reactive to stress; low scorers are calm and unflappable.

### 3. Relationship System (PRQC) & Dynamic Rules
Relationships are modeled using the PRQC framework (Perceived Relationship Quality Components). The state of these metrics triggers specific "Acting Instructions" for the AI:
-   **Satisfaction:** Determines warmth and patience. High satisfaction leads to "The Warm Glow"; low leads to "The Cold Shoulder".
-   **Commitment:** Determines future-orientation and loyalty. High commitment uses "We" language; low uses "I" language and threatens departure.
-   **Intimacy:** Determines vulnerability. High intimacy allows sharing secrets ("The Open Book"); low intimacy forces guardedness ("The Wall").
-   **Trust:** Determines skepticism. High trust accepts statements as fact ("The Believer"); low trust demands proof ("The Skeptic").
-   **Passion:** Determines physical/romantic intensity. High passion leads to "The Magnet"; low leads to "The Platonic Zone".

### 4. Bio Machine (Procedural Backstory)
A system for generating deep, consistent character histories (`src/lib/generator/BioMachine.ts`).
-   **Spine Generation:** Creates a chronological "spine" of major life phases (Spine Nodes) appropriate for the character's age.
-   **Flesh Generation:** Populates the spine with specific "Life Events" that add color and detail.
-   **Logic & Consistency:** Uses a tag-based requirement system to ensure events make sense (e.g., you can't have a "Divorce" event without a prior "Marriage" event).
-   **Output:** Generates a coherent narrative biography derived from the structured event data.

## Architectural Aspects

### 1. Technology Stack
- **Frontend:** Next.js (React) with TypeScript.
- **Backend:** Next.js API Routes (Node.js).
- **Styling:** Tailwind CSS.

### 2. Project Structure
The project adheres to the standard Next.js App Router structure:
- **`src/app/page.tsx`**: Main entry point.
- **`src/app/api/`**: Backend logic and LLM integration points.
- **`src/components/`**: React components.
- **`src/lib/`**: Utilities, types, and state management stores.

### 3. Data Flow and Persistence

#### High Level Flow 1: Chat Interaction
1.  **User Input:** User types a message in `ChatComponent`.
2.  **State Update:** `useParleyStore` updates `chatInput`.
3.  **Submission:** `useChat.handleSubmit` is triggered.
4.  **API Call:** A POST request is sent to `/api/chat` with history, current input, and context (selected character/persona IDs).
5.  **Processing:** The server constructs the prompt with world/character context and queries the LLM.
6.  **Streaming:** The LLM response is streamed back to the frontend.
7.  **Update:** `ChatComponent` updates the message list in real-time.
8.  **Persistence:** The new message history is saved to `useParleyStore` (and thus `localStorage`).

#### High Level Flow 2: Character Generation
1.  **User Request:** User opens "Generate Character" dialog in `CharacterConfiguration` and enters a prompt.
2.  **API Call:** Frontend calls `/api/generate/character` with the prompt.
3.  **LLM Generation:** Server asks LLM to return a JSON object representing the character.
4.  **Integration:** The JSON response is received by the frontend.
5.  **Store Action:** `useEntityStore.addCharacter` (or `updateCharacter`) is called.
6.  **Persistence:** The updated character list is serialized to `localStorage`.

#### High Level Flow 3: Asset Generation (Avatar)
1.  **Trigger:** User clicks "Generate Avatar" for a character.
2.  **Description Gen:** API call to `/api/generate/avatar-description` to get a visual prompt.
3.  **Image Gen:** API call to `/api/generate/avatar-image` with the visual prompt.
4.  **Upload:** Use internal upload API or cloud storage to save the image (if applicable) or use the returned URL/Base64.
5.  **Update:** The character's `avatar` field is updated in `useEntityStore`.
