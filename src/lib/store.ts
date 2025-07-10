import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BasicInfo {
    name: string
    role?: string
    faction?: string
    avatar?: string
    reputation?: string
    background?: string
    firstImpression?: string
}

interface Personality {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
}

interface RelationshipToPlayer {
    affinity: number
    notes?: string
}

interface Preferences {
    attractedToTraits?: string[]
    dislikesTraits?: string[]
    gossipTendency?: "low" | "medium" | "high"
}

export interface Character {
    id: string
    basicInfo: BasicInfo
    personality: Personality
    relationshipToPlayer: RelationshipToPlayer
    preferences?: Preferences
}

export interface PlayerPersona {
  name: string;
  alias: string;
  reputation?: string;
  background?: string;
  firstImpression?: string;
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
}

export const useParleyStore = create<ParleyStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'parley-storage',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);