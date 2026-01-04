# High-Level Design: CR002 Prompt Configuration

## 1. Introduction
This Change Request (CR) aims to centralize and expose all system prompts to the user via the "Settings" application section. This will allow users to customize the behavior of the AI for both text and image generation without modifying the codebase.

## 2. Requirements
1.  **Prompt Catalogue**: Identify and catalogue all hardcoded prompts in the system.
2.  **Settings Redesign**: Split the Settings page into "Text Generation" and "Image Generation" tabs.
3.  **Text Configuration**: Enable editing of all text generation prompts.
4.  **Image Configuration**: Enable editing of all image generation prompts.
5.  **Variable Substitution**: Ensure all prompts support dynamic variable injection using `{{variable}}` syntax.

## 3. Prompt Catalogue

The following prompts have been identified in the codebase and will be exposed for configuration.

### 3.1 Text Generation Prompts

| Prompt ID | Function / Location | Variables | Description |
| :--- | :--- | :--- | :--- |
| `chat_system` | `chatPrompts.ts` / `generateSystemPrompt` | `{{characterName}}`, `{{character}}`, `{{personaName}}`, `{{persona}}`, `{{relationship}}`, `{{world}}`, `{{style}}`, `{{summaries}}`, `{{instructions}}` | The main system instruction for the chat character. |
| `world_gen` | `generatorPrompts.ts` / `generateWorldPrompt` | `{{worldDescription}}`, `{{aiStyle}}` | Generates the static world description. |
| `character_gen` | `generatorPrompts.ts` / `generateCharacterPrompt` | `{{characterDescription}}`, `{{worldDescription}}`, `{{aiStyle}}` | Generates a full character profile (JSON). |
| `persona_gen` | `generatorPrompts.ts` / `generatePersonaPrompt` | `{{personaDescription}}`, `{{worldDescription}}`, `{{aiStyle}}` | Generates the player's persona profile. |
| `relationship_gen` | `generatorPrompts.ts` / `generateRelationshipPrompt` | `{{character}}`, `{{persona}}`, `{{worldDescription}}`, `{{aiStyle}}` | Generates the initial relationship state. |
| `relationship_delta` | `generatorPrompts.ts` / `generateRelationshipDeltaPrompt` | `{{character}}`, `{{persona}}`, `{{chatHistory}}`, `{{latestExchange}}`, `{{currentRelationship}}`, `{{worldDescription}}`, `{{aiStyle}}` | Analyzes chat to update relationship stats (Judge). |
| `ai_style_gen` | `generatorPrompts.ts` / `generateAIStylePrompt` | `{{aiStyleDescription}}` | Generates the AI writing style definition. |
| `chat_summary` | `generatorPrompts.ts` / `generateChatSummaryPrompt` | `{{chatHistory}}`, `{{worldDescription}}`, `{{aiStyle}}` | Summarizes the conversation history. |
| `analyst_system` | `analyst.ts` / `ANALYST_SYSTEM_PROMPT` | `{{chatHistory}}`, `{{character}}`, `{{persona}}` | The Analyst engine's system prompt for scene analysis. |

### 3.2 Image Generation Prompts

| Prompt ID | Location | Variables | Description |
| :--- | :--- | :--- | :--- |
| `avatar_desc` | `imageGenerationPrompts.ts` / `generateImageDescriptionPrompt` | `{{characterOrPersonaData}}` (includes name, age, role, appearance) | Generates a visual description for the avatar generator. |

## 4. Proposed Changes

### 4.1 Backend / API

1.  **Prompt Store**: A new mechanism to store and retrieve user-defined prompt templates.
    *   **Implementation**: A file-based store (e.g., `config/user-prompts.json` or within `src/lib/config`).
    *   **Default Fallback**: If a user template is not found, the system will fall back to the existing hardcoded templates.

2.  **API Refactoring**:
    *   Update `src/lib/prompts/*.ts` functions to accept an optional `templateOverride` string.
    *   Create a wrapper or service to fetch the current template (default or user-defined) before calling the generator functions.
    *   Refactor `src/lib/engine/analyst.ts` to accept an injected system prompt instead of the hardcoded `ANALYST_SYSTEM_PROMPT`.

3.  **New API Endpoints**:
    *   `GET /api/settings/prompts`: Retrieve all current prompt templates (user-defined or default).
    *   `POST /api/settings/prompts`: Update a specific prompt template.
    *   `POST /api/settings/prompts/reset`: Reset a prompt to its default factory state.

### 4.2 Frontend (Settings Page)

The Settings page (`src/app/settings/page.tsx`) will be redesigned.

#### Layout
*   **Tabs Component**: A top-level tab structure to switch between:
    *   **General** (Existing settings like models)
    *   **Text Generation** (New prompt config)
    *   **Image Generation** (New prompt config)

#### Text / Image Generation Tabs
*   **Prompt Editor Component**:
    *   **Dropdown/Accordion**: List of available prompts (e.g., "Chat System Prompt", "Analyst Prompt").
    *   **Editor Area**: A large text area to edit the prompt template.
    *   **Variable Legend**: A display of available `{{variables}}` that can be used in the current prompt.
    *   **Actions**: "Save", "Reset to Default".

## 5. Variable Standardization
All prompts will be updated to use a consistent double-curly-brace syntax (`{{variable}}`) for replacements.
Existing string concatenation logic in `src/lib/prompts/*.ts` will be replaced with a robust `.replace` or template engine approach to ensure user-placed variables are correctly populated.

## 6. Implementation Plan

### Phase 1: Backend Foundation
1.  **Create Prompt Store**: Implement `src/lib/store/promptStore.ts` to handle loading/saving of prompts to a JSON file. Defined types for `PromptConfig`.
2.  **Implement API Routes**:
    *   `src/app/api/settings/prompts/route.ts` (GET, POST)
    *   `src/app/api/settings/prompts/reset/route.ts` (POST)
3.  **Refactor Prompt Generators**: Update usage of `generateSystemPrompt`, `generateCharacterPrompt`, etc., in `src/lib/prompts/` and `src/lib/engine/` to fetch templates from the `PromptStore` before string interpolation.

### Phase 2: Frontend Implementation
1.  **Create UI Components**:
    *   `src/components/settings/SettingsTabs.tsx`: Tab navigation.
    *   `src/components/settings/PromptEditor.tsx`: Reusable editor with variable legend.
    *   `src/components/settings/TextGenerationSettings.tsx`: Container for text prompts.
    *   `src/components/settings/ImageGenerationSettings.tsx`: Container for image prompts.
2.  **Update Settings Page**: Refactor `src/app/settings/page.tsx` to use the new tabs and components.

### Phase 3: Integration & specific Prompts
1.  **Analyst Engine**: Move `ANALYST_SYSTEM_PROMPT` from `analyst.ts` to the central prompt system and ensure it's loaded correctly.
2.  **Generator Prompts**: Ensure all generator functions (`world`, `character`, `relationship`, etc.) correctly retrieve the latest stored prompt.

### Phase 4: Verification
1.  **Validation**:
    *   Verify checking settings updates persists prompts.
    *   Verify generating content uses the modified prompts.
    *   Verify "Reset to Default" restores original behavior.
