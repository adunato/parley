# Parley: Game Design Document

## Overview
Parley is a web-based text adventure game designed to provide an immersive and interactive storytelling experience. Built with Next.js and TypeScript, the application leverages modern web technologies to deliver a dynamic narrative where player choices directly influence the unfolding story.

## Key Design Principles

### 1. Choice-Driven Narrative
The core of Parley's design revolves around player agency. The game presents users with choices that impact the story's progression, character relationships, and world state, encouraging replayability and personalized experiences.

### 2. Dynamic Content Generation
To enhance the adventure and provide fresh experiences, Parley incorporates AI-powered content generation for characters and player personas. This allows for a rich and varied cast of non-player characters (NPCs) and customizable player identities.

### 3. Intuitive User Interface
The game features a clean and responsive web interface, ensuring that players can easily navigate choices, manage their character/persona, and engage with the narrative without friction. This includes dedicated displays for character traits and dynamic relationship metrics.

### 4. Persistent Data Management
Player-created characters and personas are designed to be persistent. The system allows for the creation, editing, and **overwriting** of these records, ensuring that players can refine their game elements over time without losing progress or creating redundant entries.

## Architectural Aspects

### 1. Technology Stack
- **Frontend:** Next.js (React) with TypeScript for a robust and scalable user interface.
- **Backend:** Next.js API Routes (Node.js) for handling game logic, data persistence, and AI integrations.

### 2. Project Structure
The project adheres to the standard Next.js App Router structure, promoting clear separation of concerns and maintainability:
- **`src/app/page.tsx`**: Serves as the main entry point for the frontend application.
- **`src/app/api/chat/route.ts`**: Manages the backend logic for the interactive chat component, facilitating communication with language models for narrative generation.
- **`src/app/api/generate/character/route.ts` & `src/app/api/generate/persona/route.ts`**: API endpoints responsible for generating character and persona data, respectively.
- **`src/components/`**: Contains reusable React components, including `character-configuration.tsx` and `persona-configuration.tsx` for managing game entities.
- **`src/lib/store.ts`**: Centralized state management for game data, including characters and player personas, ensuring data consistency across the application.

### 3. Data Flow and Persistence
Game data, such as characters and player personas, is managed through a centralized store (`useParleyStore`). Relationships are now stored as an array within each `Character` object. Generation processes interact with API routes to create new data, which is then integrated into the application's state. The recent update ensures that when generating new characters or personas, existing selected records are overwritten, streamlining the content creation workflow and preventing data duplication.