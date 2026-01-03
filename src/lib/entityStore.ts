import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, Persona, Relationship, CharacterGroup } from './types';

type EntityStore = {
  characters: Character[];
  characterGroups: CharacterGroup[];
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  playerPersonas: Persona[];
  addPlayerPersona: (persona: Persona) => void;
  updatePlayerPersona: (persona: Persona) => void;
  deletePlayerPersona: (id: string) => void;
  addCharacterGroup: (characterGroup: CharacterGroup) => void;
  updateCharacterGroup: (characterGroup: CharacterGroup) => void;
  deleteCharacterGroup: (id: string) => void;
  selectedChatCharacter?: Character;
  setSelectedChatCharacter: (character: Character | undefined) => void;
  selectedChatPersona?: Persona;
  setSelectedChatPersona: (persona: Persona | undefined) => void;
  clearCharacters: () => void;
  cumulativeRelationshipDelta?: Relationship; // Optional: Stores cumulative deltas for the current chat session
  updateCumulativeRelationshipDelta: (delta: Relationship) => void;
  clearCumulativeRelationshipDelta: () => void; // Called on new chat
  clearAllData: () => void;
};

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, {
          ...character,
          relationships: []
        }]
      })),
      updateCharacter: (updatedCharacter) => {
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === updatedCharacter.id ? updatedCharacter : char
          ),
          selectedChatCharacter: state.selectedChatCharacter?.id === updatedCharacter.id
            ? updatedCharacter
            : state.selectedChatCharacter,
        }));
      },
      deleteCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id),
        })),
      playerPersonas: [],
      addPlayerPersona: (persona) => set((state) => ({ playerPersonas: [...state.playerPersonas, persona] })),
      updatePlayerPersona: (updatedPersona) =>
        set((state) => ({
          playerPersonas: state.playerPersonas.map((p) =>
            p.id === updatedPersona.id ? updatedPersona : p
          ),
        })),
      deletePlayerPersona: (id) =>
        set((state) => ({
          playerPersonas: state.playerPersonas.filter((p) => p.id !== id),
        })),
      characterGroups: [],
      addCharacterGroup: (characterGroup) => set((state) => ({
        characterGroups: [...state.characterGroups, characterGroup]
      })),
      updateCharacterGroup: (updatedCharacterGroup) =>
        set((state) => ({
          characterGroups: state.characterGroups.map((group) =>
            group.id === updatedCharacterGroup.id ? updatedCharacterGroup : group
          ),
        })),
      deleteCharacterGroup: (id) =>
        set((state) => ({
          characterGroups: state.characterGroups.filter((group) => group.id !== id),
        })),
      selectedChatCharacter: undefined,
      setSelectedChatCharacter: (character) => set({ selectedChatCharacter: character }),
      selectedChatPersona: undefined,
      setSelectedChatPersona: (persona) => set({ selectedChatPersona: persona }),
      clearCharacters: () => set({ characters: [] }),
      cumulativeRelationshipDelta: undefined,
      updateCumulativeRelationshipDelta: (delta: Relationship) =>
        set((state) => {
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
      clearAllData: () => {
        set({
          characters: [],
          playerPersonas: [],
          selectedChatCharacter: undefined,
          selectedChatPersona: undefined,
          cumulativeRelationshipDelta: undefined,
          characterGroups: [],
        });
        useEntityStore.persist.clearStorage();
      },
    }),
    {
      name: 'entity-store', // persists to localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure all characters have a relationships array
          if (state.characters) {
            state.characters = state.characters.map(character => ({
              ...character,
              relationships: (character.relationships || []).map((rel: any) => ({
                ...rel,
                satisfaction: rel.satisfaction ?? 50,
                commitment: rel.commitment ?? 50,
                intimacy: rel.intimacy ?? 50,
                trust: rel.trust ?? 50,
                passion: rel.passion ?? 50
              })),
              idealMatch: character.idealMatch || { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 }
            }));
          }
          if (state.playerPersonas) {
            state.playerPersonas = state.playerPersonas.map(persona => ({
              ...persona,
              basicInfo: persona.basicInfo || {
                name: persona.id, // Use ID as name if basicInfo is missing
                age: 0,
                gender: "",
                role: "",
                faction: "",
                reputation: "",
                background: "",
                firstImpression: "",
                appearance: "",
              }
            }));
          }
        }
      },
    }
  )
);
