# 🗃️ State Management

Managing state effectively is crucial for optimizing your application's performance. Instead of storing all state information in a single centralized repository, consider dividing it into various categories based on their usage. By categorizing your state, you can streamline your state management process and enhance your application's overall efficiency.

## Component State

Component state is specific to individual components and should not be shared globally. It can be passed down to child components as props when necessary. Typically, you should begin by defining state within the component itself and consider elevating it to a higher level if it's required elsewhere in the application. When managing component state, you can use the following React hooks:

- [useState](https://react.dev/reference/react/useState) - for simpler states that are independent
- [useReducer](https://react.dev/reference/react/useReducer) - for more complex states where on a single action you want to update several pieces of state

[Component State Example Code](../apps/react-vite/src/components/layouts/dashboard-layout.tsx)

## Application State

Application state manages global parts of an application, such as controlling global modals, notifications, and toggling color modes. To ensure optimal performance and ease of maintenance, it is advisable to localize the state as closely as possible to the components that require it. Avoid unnecessarily globalizing all state variables from the outset to maintain a structured and efficient state management architecture.

Good Application State Solutions:

- [context](https://react.dev/learn/passing-data-deeply-with-context) + [hooks](https://react.dev/reference/react-dom/hooks)
- [redux](https://redux.js.org/) + [redux toolkit](https://redux-toolkit.js.org/)
- [mobx](https://mobx.js.org)
- [zustand](https://github.com/pmndrs/zustand)
- [jotai](https://github.com/pmndrs/jotai)
- [xstate](https://xstate.js.org/)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';
import { Character, Location, Persona, Relationship, CharacterGroup } from '../types';
import { Message } from '@ai-sdk/react';

// This store manages the ACTIVE game session.
// It is initialized by cloning data from the EntityStore (World Configuration).

interface GameState {
    // Session Meta
    isGameActive: boolean;
    gameStartedAt: number | null;
    lastSavedAt: number | null;
    sourceWorldConfigId: string | null;

    // Runtime World State
    characters: Character[];
    playerPersonas: Persona[]; // In case we want to allow evolving personas
    locations: Location[];
    characterGroups: CharacterGroup[];

    // Active Play State
    chatMessages: Message[];
    currentLocationId: string | null;
    currentPersonaId: string | null;
    currentCharacterId: string | null; // The character the player is actively talking to

    cumulativeRelationshipDelta: Relationship | undefined; // Session delta

    // Actions
    startGame: (config: WorldConfigSnapshot, initialPersonaId?: string) => void;
    resumeGame: () => void; // Mostly just a state check
    endGame: () => void;

    // State Mutators (Runtime)
    updateCharacter: (character: Character) => void;
    setChatMessages: (messages: Message[]) => void;
    setCurrentLocationId: (id: string | null) => void;
    setCurrentPersonaId: (id: string | null) => void;
    setCurrentCharacterId: (id: string | null) => void;
    updateCumulativeRelationshipDelta: (delta: Relationship) => void;
    clearCumulativeRelationshipDelta: () => void;
    clearChat: () => void;

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export interface WorldConfigSnapshot {
    characters: Character[];
    playerPersonas: Persona[];
    locations: Location[];
    characterGroups: CharacterGroup[];
    id?: string; // Optional ID for the config source
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            isGameActive: false,
            gameStartedAt: null,
            lastSavedAt: null,
            sourceWorldConfigId: null,

            characters: [],
            playerPersonas: [],
            locations: [],
            characterGroups: [],

            chatMessages: [],
            currentLocationId: null,
            currentPersonaId: null,
            currentCharacterId: null,

            cumulativeRelationshipDelta: undefined,

            startGame: (config, initialPersonaId) => {
                // Deep copy to ensure we don't mutate the config
                // JSON parse/stringify is a simple way to deep clone for these plain objects
                const clonedConfig = JSON.parse(JSON.stringify(config));

                set({
                    isGameActive: true,
                    gameStartedAt: Date.now(),
                    lastSavedAt: Date.now(),

                    characters: clonedConfig.characters || [],
                    playerPersonas: clonedConfig.playerPersonas || [],
                    locations: clonedConfig.locations || [],
                    characterGroups: clonedConfig.characterGroups || [],

                    chatMessages: [],
                    // Keep previous selection if valid, or reset? Resetting is safer for a "New Game".
                    currentLocationId: null,
                    currentCharacterId: null,
                    // Requirement: Pick selected persona OR first persona from the list
                    currentPersonaId: initialPersonaId || (clonedConfig.playerPersonas && clonedConfig.playerPersonas.length > 0
                        ? clonedConfig.playerPersonas[0].id
                        : null),
                });
            },

            resumeGame: () => {
                // Just marking as active or validating state could go here
                set({ isGameActive: true });
            },

            endGame: () => {
                set({ isGameActive: false });
            },

            updateCharacter: (updatedCharacter) => set((state) => ({
                characters: state.characters.map(c =>
                    c.id === updatedCharacter.id ? updatedCharacter : c
                ),
                lastSavedAt: Date.now()
            })),

            setChatMessages: (messages) => set({
                chatMessages: messages,
                lastSavedAt: Date.now()
            }),

            setCurrentLocationId: (id) => set({ currentLocationId: id }),
            setCurrentPersonaId: (id) => set({ currentPersonaId: id }),
            setCurrentCharacterId: (id) => set({ currentCharacterId: id }),

            updateCumulativeRelationshipDelta: (delta) => set((state) => {
                const currentDelta = state.cumulativeRelationshipDelta;
                if (currentDelta) {
                    return {
                        cumulativeRelationshipDelta: {
                            ...currentDelta,
                            satisfaction: currentDelta.satisfaction + delta.satisfaction,
                            commitment: currentDelta.commitment + delta.commitment,
                            intimacy: currentDelta.intimacy + delta.intimacy,
                            trust: currentDelta.trust + delta.trust,
                            passion: currentDelta.passion + delta.passion,
                            description: `${currentDelta.description}\\n${delta.description}`,
                        },
                    };
                } else {
                    return { cumulativeRelationshipDelta: delta };
                }
            }),

            clearCumulativeRelationshipDelta: () => set({ cumulativeRelationshipDelta: undefined }),

            clearChat: () => set({ chatMessages: [] }),

            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'parley-game-state',
            storage: createJSONStorage(() => DexieStorageAdapter),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
```

## Server Cache State

The Server Cache State refers to the data retrieved from the server that is stored locally on the client-side for future use. While it is feasible to cache remote data within a state management store like Redux, there exist more optimal solutions to this practice. It is essential to consider more efficient caching mechanisms to enhance performance and optimize data retrieval processes.

Good Server Cache Libraries:

- [react-query](https://tanstack.com/query) - REST + GraphQL
- [swr](https://swr.vercel.app/) - REST + GraphQL
- [apollo client](https://www.apollographql.com/) - GraphQL
- [urql](https://formidable.com/open-source/urql/) - GraphQl
- [RTK](https://redux-toolkit.js.org/rtk-query)

[Server Cache State Example Code](../apps/react-vite/src/features/discussions/api/get-discussions.ts)

## Form State

Forms are a crucial part of any application, and managing form state effectively is essential for a seamless user experience. When handling form state, consider using libraries like Formik, React Hook Form, or Final Form to streamline the process. These libraries provide built-in validation, error handling, and form submission functionalities, making it easier to manage form state within your application.

Forms in React can be [controlled and uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components).

Depending on the application needs, they might be pretty complex with many different fields that require validation.

Although it is possible to build any form using only React primitives, there are some good solutions out there that help with handling forms such as:

- [React Hook Form](https://react-hook-form.com/)
- [Formik](https://formik.org/)
- [React Final Form](https://github.com/final-form/react-final-form)

Create abstracted `Form` component and all the input field components that wrap the library functionality and are adapted to the application needs.

[Form Example Code](../apps/react-vite/src/components/ui/form/form.tsx)

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

You can also integrate validation libraries with the mentioned solutions to validate inputs on the client. Some good options are:

- [zod](https://github.com/colinhacks/zod)
- [yup](https://github.com/jquense/yup)

[Validation Example Code](../apps/react-vite/src/features/auth/components/register-form.tsx)

## URL State

URL state refers to the data stored and manipulated within the address bar of the browser. This state is commonly managed through URL parameters (e.g., /app/${dynamicParam}) or query parameters (e.g., /app?dynamicParam=1). By incorporating routing solutions like react-router-dom, you can effectively access and control the URL state, enabling dynamic manipulation of application parameters directly from the browser's address bar.

[URL State Example Code](../apps/react-vite/src/features/discussions/components/discussion-view.tsx)
