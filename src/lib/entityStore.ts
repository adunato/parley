import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Character = {
  id: string;
  name: string;
  description: string;
  personalityTraits: string[];
  motives: string[];
  affiliation: string | null;
  sceneIntroduced: string;
  imageUrl?: string;
};

type EntityStore = {
  characters: Record<string, Character>; // characterId -> Character
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  getCharacterById: (id: string) => Character | undefined;
};

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      characters: {},

      addCharacter: (char) =>
        set((state) => ({
          characters: {
            ...state.characters,
            [char.id]: char,
          },
        })),

      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: {
            ...state.characters,
            [id]: {
              ...state.characters[id],
              ...updates,
            },
          },
        })),

      getCharacterById: (id) => get().characters[id],
    }),
    {
      name: 'entity-store', // persists to localStorage
    }
  )
);
