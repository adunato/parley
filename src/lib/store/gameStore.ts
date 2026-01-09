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
    startGame: (config: WorldConfigSnapshot) => void;
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

            startGame: (config) => {
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
                            description: `${currentDelta.description}\n${delta.description}`,
                        },
                    };
                } else {
                    return { cumulativeRelationshipDelta: delta };
                }
            }),

            clearCumulativeRelationshipDelta: () => set({ cumulativeRelationshipDelta: undefined }),

            clearChat: () => set({ chatMessages: [] })
        }),
        {
            name: 'parley-game-state',
            storage: createJSONStorage(() => DexieStorageAdapter),
        }
    )
);
