import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';
import { Character, Location, Relationship, Household } from '../types';
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
    locations: Location[];
    households: Household[];

    // Active Play State
    chatMessages: Message[];
    currentLocationId: string | null;
    currentPlayerCharacterId: string | null;
    currentCharacterId: string | null; // The character the player is actively talking to

    cumulativeRelationshipDelta: Relationship | undefined; // Session delta

    // Actions
    startGame: (config: WorldConfigSnapshot, initialPlayerCharacterId?: string) => void;
    resumeGame: () => void; // Mostly just a state check
    endGame: () => void;

    // State Mutators (Runtime)
    updateCharacter: (character: Character) => void;
    setChatMessages: (messages: Message[]) => void;
    setCurrentLocationId: (id: string | null) => void;
    setCurrentPlayerCharacterId: (id: string | null) => void;
    setCurrentCharacterId: (id: string | null) => void;
    updateCumulativeRelationshipDelta: (delta: Relationship) => void;
    clearCumulativeRelationshipDelta: () => void;
    clearChat: () => void;

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export interface WorldConfigSnapshot {
    characters: Character[];
    locations: Location[];
    households: Household[];
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
            locations: [],
            households: [],

            chatMessages: [],
            currentLocationId: null,
            currentPlayerCharacterId: null,
            currentCharacterId: null,

            cumulativeRelationshipDelta: undefined,

            startGame: (config, initialPlayerCharacterId) => {
                // Deep copy to ensure we don't mutate the config
                // JSON parse/stringify is a simple way to deep clone for these plain objects
                const clonedConfig = JSON.parse(JSON.stringify(config));

                set({
                    isGameActive: true,
                    gameStartedAt: Date.now(),
                    lastSavedAt: Date.now(),

                    characters: clonedConfig.characters || [],
                    locations: clonedConfig.locations || [],
                    households: clonedConfig.households || [],

                    chatMessages: [],
                    // Keep previous selection if valid, or reset? Resetting is safer for a "New Game".
                    currentLocationId: null,
                    currentCharacterId: null,
                    // Requirement: Pick selected character OR first character from the list
                    currentPlayerCharacterId: initialPlayerCharacterId || (clonedConfig.characters && clonedConfig.characters.length > 0
                        ? clonedConfig.characters[0].id
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
            setCurrentPlayerCharacterId: (id) => set({ currentPlayerCharacterId: id }),
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
                            description: `${currentDelta.description}\n${delta.description}`,
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
