# High-Level Design: Prompt Optimisation (CR003)

## 1. Introduction
This Change Request focuses on optimizing the prompts used in the application.

## 2. Goals
- Improve prompt efficiency.
- Enhance response quality.
- Remove outdated or unused profile fields to reduce token usage and noise.

## 3. Proposed Changes

### 3.1 Data Model Updates
- Remove `preferences` object from `Character` interface.
- Remove `attractedToTraits` (string array).
- Remove `dislikesTraits` (string array).
- Remove `gossipTendency` (string enum).

### 3.2 UI Updates
- Remove "Preferences" section from Character Configuration screen.
- Remove inputs for Attracted Traits, Disliked Traits, and Gossip Tendency.

### 3.3 System Prompt Updates
- Remove instructions referencing `attractedToTraits`, `dislikesTraits`, and `gossipTendency`.
- Update `GenerateSystemPrompt` to exclude these fields.

### 3.4 Data Contextualization
- Break down `{{character}}` variable in the system prompt into granular sections:
    - `{{characterBasicInfo}}`: Contains `name`, `role`, `background`, etc.
    - `{{characterPersonality}}`: Contains OCEAN traits.
    - `{{characterIdealMatch}}`: Contains ideal match traits.
- Update `chat_system` prompt template to use these new variables with descriptive headers to provide better context to the LLM.

### 3.5 OCEAN Trait Descriptions
- Replace raw numerical values for OCEAN traits with descriptive text in the prompt.
- Create `config/ocean-traits.ts` to define these descriptions across 5 levels (e.g., Very Low, Low, Moderate, High, Very High).
- Update `GenerateSystemPrompt` to substitute numbers with these descriptions.


