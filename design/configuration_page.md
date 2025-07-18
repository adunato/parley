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
The `llm` instance (which is `ChatOpenAI`) in `src/lib/llm.ts` will be updated to dynamically use the selected model. The `generateJSON` function, and any other future text generation functions, will accept an optional `model` parameter.

*   **Dynamic Model Selection**: The `llm` instance will be re-initialized or its `model` property updated based on the `model` parameter passed to the generation functions.
*   **Default Model**: If no model is explicitly passed, the current default model (`deepseek/deepseek-chat`) will be used.

### Differentiation of Input Models (Client-Server Communication)
The model configuration is indeed stored on the client side. To differentiate the input model on the server-side API routes, the client will send the selected model ID with each relevant API request.

*   **Client-Side**: When making a request to a server-side API route (e.g., `/api/chat`, `/api/generate/character`, `/api/summarise`), the client will retrieve the appropriate selected model ID (e.g., chat model ID for `/api/chat`) from its local state/`localStorage` and include it in the request body.
*   **Server-Side API Routes**: Each API route will:
    1.  Receive the model ID as part of the incoming request (e.g., `req.body.modelId`).
    2.  Pass this received `modelId` to the corresponding function in `src/lib/llm.ts` (e.g., `llm.generateJSON(prompt, modelId)`).
    3.  The `llm.ts` functions will then use this `modelId` to configure the `ChatOpenAI` instance for that specific request.

## 3. Data Flow

1.  User navigates to the Settings page.
2.  Frontend fetches available models from `src/app/api/models/route.ts`.
3.  User selects desired models for Chat, Summarization, and Generation.
4.  Selected model IDs are stored in global state and `localStorage`.
5.  When an API route (e.g., `/api/chat`) is called:
    *   The client-side code retrieves the appropriate model ID (e.g., chat model ID) from its persisted state.
    *   The client sends this model ID along with the request data to the server-side API route.
    *   The server-side API route receives the model ID from the request.
    *   The API route passes this `modelId` as a parameter to the relevant function in `src/lib/llm.ts` (e.g., `llm.generateJSON`).
    *   `llm.ts` uses the provided `modelId` to configure the `ChatOpenAI` instance for the current request to the OpenRouter API.
