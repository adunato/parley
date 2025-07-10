import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BasicInfo {
    name: string
    role?: string
    faction?: string
    avatar?: string
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
  playerPersona: PlayerPersona | null;
  setPlayerPersona: (persona: PlayerPersona) => void;
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
      playerPersona: null,
      setPlayerPersona: (persona) => set({ playerPersona: persona }),
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