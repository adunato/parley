import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, Persona } from './types';

type EntityStore = {
  characters: Record<string, Character>; // characterId -> Character
  playerPersonas: Record<string, Persona>; // personaId -> Persona
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  getCharacterById: (id: string) => Character | undefined;
  addPlayerPersona: (persona: Persona) => void;
  updatePlayerPersona: (id: string, updates: Partial<Persona>) => void;
  getPlayerPersonaById: (id: string) => Persona | undefined;
};

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      characters: {},
      playerPersonas: {},

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

      addPlayerPersona: (persona) =>
        set((state) => ({
          playerPersonas: {
            ...state.playerPersonas,
            [persona.id]: persona,
          },
        })),

      updatePlayerPersona: (id, updates) =>
        set((state) => ({
          playerPersonas: {
            ...state.playerPersonas,
            [id]: {
              ...state.playerPersonas[id],
              ...updates,
            },
          },
        })),

      getPlayerPersonaById: (id) => get().playerPersonas[id],
    }),
    {
      name: 'entity-store', // persists to localStorage
    }
  )
);
