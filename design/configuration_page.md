# REQUIREMENTS
- User must be able to open a settings page
- Settings page should contain a chat model selection dropdown
- Settings page should contain a summarisation model selection dropdown
- Settings page should contain a generation model selection dropdown
- Model selection dropdowns should be populated with available models from OpenRouter API
- Model selection should be split into providers and models
- Provider should be a dropdown - hardcoded for now with only OpenRouter
- Model should be a dropdown with search functionality (i.e. filter choices as user types)
- Model should no longer be hardcoded in the llm library, but passed in as a parameter
- The call to the LLM library should differentiate input model based on settings and context (i.e. chat vs generation vs summarisation)

# Design Proposal

## 1. User Interface (UI) / User Experience (UX)

### Settings Page Access
A new navigation link or button will be added to the main application layout (e.g., in `src/app/layout.tsx` or a dedicated navigation component) to allow users to access the "Settings" page. This page will be located at a new route, e.g., `/settings`.

### Settings Page Layout
The settings page (`src/app/settings/page.tsx`) will feature a clean, form-like layout. Each model selection (Chat, Summarization, Generation) will have its own dedicated section.

### Model Selection Components
For each model type (Chat, Summarization, Generation), the following UI elements will be used:

*   **Provider Dropdown**: A `<Select>` component (from `src/components/ui/select.tsx`) will be used for selecting the provider. Initially, this will be hardcoded to "OpenRouter". This component will display the currently selected provider.
*   **Model Dropdown with Search**: A custom component will be created that combines an `<Input>` field (for search/filtering) and a `<Select>` or similar dropdown for displaying the available models. As the user types in the input field, the list of models in the dropdown will be filtered dynamically. The dropdown will display the `name` of the model, and its `id` will be used as the value.

### Persistence
User selections for chat, summarization, and generation models will be stored locally using a state management solution (e.g., Zustand, or React Context API if simple enough, or even `localStorage` for persistence across sessions). This will ensure that the user's chosen models are remembered.

## 2. Technical Design

### Fetching Available Models
A new API route will be created (e.g., `src/app/api/models/route.ts`) to fetch the list of available models from the OpenRouter API. This route will:
*   Make a request to the OpenRouter API's models endpoint.
*   Filter and format the response to provide a list of models suitable for display in the UI (e.g., `id`, `name`, `provider`).
*   Cache the response to reduce redundant API calls.

The frontend settings page will call this API route on component mount to populate the model selection dropdowns.

### State Management for Model Selection
*   **Frontend State**: The selected chat, summarization, and generation models will be stored in a global state management solution (e.g., a Zustand store or a React Context). This store will hold the `id` of the selected model for each category.
*   **Persistence**: The selected model IDs will be persisted in `localStorage` so that they are remembered across browser sessions.

### Modifying the LLM Library (`src/lib/llm.ts`)
The `llm.ts` library will be updated to accept a `model` parameter for its functions (e.g., `chat`, `generate`, `summarize`).

*   **Default Model**: If no model is explicitly passed, a default model will be used (e.g., the current hardcoded model).
*   **Dynamic Model Selection**: The API routes (`src/app/api/chat/route.ts`, `src/app/api/generate/.../route.ts`, `src/app/api/summarise/route.ts`) will retrieve the user's selected model from the global state (or `localStorage` if accessed directly on the server-side for initial requests) and pass it to the `llm.ts` functions.

### Differentiation of Input Models
The API routes will be responsible for differentiating the input model based on their context:
*   `src/app/api/chat/route.ts` will retrieve the user's selected **chat model** from the state and pass it to `llm.chat()`.
*   `src/app/api/generate/.../route.ts` routes will retrieve the user's selected **generation model** from the state and pass it to `llm.generate()`.
*   `src/app/api/summarise/route.ts` will retrieve the user's selected **summarization model** from the state and pass it to `llm.summarize()`.

## 3. Data Flow

1.  User navigates to the Settings page.
2.  Frontend fetches available models from `src/app/api/models/route.ts`.
3.  User selects desired models for Chat, Summarization, and Generation.
4.  Selected model IDs are stored in global state and `localStorage`.
5.  When an API route (e.g., `/api/chat`) is called:
    *   The API route retrieves the appropriate model ID (e.g., chat model ID) from the persisted state.
    *   The model ID is passed as a parameter to the relevant function in `src/lib/llm.ts`.
    *   `llm.ts` uses the provided model ID to make the request to the OpenRouter API.