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