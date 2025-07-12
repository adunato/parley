import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '@ai-sdk/react';

interface BasicInfo {
    name: string
    age?: number
    role?: string
    faction?: string
    avatar?: string
    reputation?: string
    background?: string
    firstImpression?: string
    appearance?: string
}

interface Personality {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
}

interface Preferences {
    attractedToTraits?: string[]
    dislikesTraits?: string[]
    gossipTendency?: "low" | "medium" | "high"
}

export interface Relationship {
  closeness: number;
  attraction: number;
  respect: number;
  engagement: number;
  stability: number;
}

export interface Character {
    id: string
    basicInfo: BasicInfo
    personality: Personality
    preferences?: Preferences
}

export interface PlayerPersona {
  name: string;
  alias: string;
  age?: number;
  reputation?: string;
  background?: string;
  firstImpression?: string;
  appearance?: string;
  role?: string;
  faction?: string;
  avatar?: string;
}

interface ParleyStore {
  gameInitialized: boolean;
  initializeGame: () => void;
  characters: Character[];
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  playerPersonas: PlayerPersona[];
  addPlayerPersona: (persona: PlayerPersona) => void;
  updatePlayerPersona: (persona: PlayerPersona) => void;
  deletePlayerPersona: (id: string) => void;
  worldDescription: string;
  setWorldDescription: (description: string) => void;
  aiStyle: string;
  setAiStyle: (style: string) => void;
  selectedChatCharacter?: Character;
  setSelectedChatCharacter: (character: Character | undefined) => void;
  selectedChatPersona?: PlayerPersona;
  setSelectedChatPersona: (persona: PlayerPersona | undefined) => void;
  chatMessages: Message[];
  setChatMessages: (messages: Message[]) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  clearChat: () => void;
  _hasHydrated: boolean;
  _setHasHydrated: (hydrated: boolean) => void;
  chatSessionId: number;
  relationships: Map<string, Map<string, Relationship>>; // New relationships state
  addRelationship: (characterId: string, personaAlias: string, relationship: Relationship) => void;
  updateRelationship: (characterId: string, personaAlias: string, relationship: Relationship) => void;
  getRelationship: (characterId: string, personaAlias: string) => Relationship | undefined;
  deleteRelationship: (characterId: string, personaAlias: string) => void;
}

export const useParleyStore = create<ParleyStore>()(
  persist(
    (set, get) => ({
      gameInitialized: false,
      initializeGame: () => set({ gameInitialized: true }),
      characters: [],
      addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
      updateCharacter: (updatedCharacter) =>
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === updatedCharacter.id ? updatedCharacter : char
          ),
        })),
      deleteCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id),
        })),
      playerPersonas: [],
      addPlayerPersona: (persona) => set((state) => ({ playerPersonas: [...state.playerPersonas, persona] })),
      updatePlayerPersona: (updatedPersona) =>
        set((state) => ({
          playerPersonas: state.playerPersonas.map((p) =>
            p.alias === updatedPersona.alias ? updatedPersona : p
          ),
        })),
      deletePlayerPersona: (id) =>
        set((state) => ({
          playerPersonas: state.playerPersonas.filter((p) => p.alias !== id),
        })),
      worldDescription: '',
      setWorldDescription: (description) => set({ worldDescription: description }),
      aiStyle: '',
      setAiStyle: (style) => set({ aiStyle: style }),
      selectedChatCharacter: undefined,
      setSelectedChatCharacter: (character) => set({ selectedChatCharacter: character }),
      selectedChatPersona: undefined,
      setSelectedChatPersona: (persona) => set({ selectedChatPersona: persona }),
      chatMessages: [],
      setChatMessages: (messages) => set({ chatMessages: messages }),
      chatInput: '',
      setChatInput: (input) => set({ chatInput: input }),
      clearChat: () => set((state) => {
        const prevChatSessionId = state.chatSessionId;
        localStorage.removeItem(`ai-sdk:chat:main-chat-${prevChatSessionId}`); // Clear previous @ai-sdk/react useChat persistence
        useParleyStore.persist.clearStorage(); // Correctly clear Zustand store persistence
        const newChatSessionId = state.chatSessionId + 1;
        return {
          selectedChatCharacter: undefined,
          selectedChatPersona: undefined,
          chatMessages: [],
          chatInput: '',
          chatSessionId: newChatSessionId,
        };
      }),
      _setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      chatSessionId: 0,
      _hasHydrated: false,
      relationships: new Map(), // Initialize relationships map
      addRelationship: (characterId, personaAlias, relationship) =>
        set((state) => {
          const newRelationships = new Map(state.relationships);
          if (!newRelationships.has(characterId)) {
            newRelationships.set(characterId, new Map());
          }
          newRelationships.get(characterId)?.set(personaAlias, relationship);
          return { relationships: newRelationships };
        }),
      updateRelationship: (characterId, personaAlias, relationship) =>
        set((state) => {
          const newRelationships = new Map(state.relationships);
          if (newRelationships.has(characterId)) {
            newRelationships.get(characterId)?.set(personaAlias, relationship);
          }
          return { relationships: newRelationships };
        }),
      getRelationship: (characterId, personaAlias) =>
        get().relationships.get(characterId)?.get(personaAlias),
      deleteRelationship: (characterId, personaAlias) =>
        set((state) => {
          const newRelationships = new Map(state.relationships);
          if (newRelationships.has(characterId)) {
            newRelationships.get(characterId)?.delete(personaAlias);
            if (newRelationships.get(characterId)?.size === 0) {
              newRelationships.delete(characterId);
            }
          }
          return { relationships: newRelationships };
        }),
    }),
    {
      name: 'parley-storage',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);