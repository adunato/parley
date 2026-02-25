import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from './storage-adapter';
import { Character, Relationship, CharacterGroup, Location, GameAttributeCategory, GameAttribute } from './types';

type EntityStore = {
  characters: Character[];
  characterGroups: CharacterGroup[];
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  addCharacterGroup: (characterGroup: CharacterGroup) => void;
  updateCharacterGroup: (characterGroup: CharacterGroup) => void;
  deleteCharacterGroup: (id: string) => void;
  locations: Location[];
  addLocation: (location: Location) => void;
  updateLocation: (location: Location) => void;
  deleteLocation: (id: string) => void;
  selectedChatLocation?: Location;
  setSelectedChatLocation: (location: Location | undefined) => void;
  selectedChatCharacter?: Character;
  setSelectedChatCharacter: (character: Character | undefined) => void;
  clearCharacters: () => void;
  cumulativeRelationshipDelta?: Relationship; // Optional: Stores cumulative deltas for the current chat session
  updateCumulativeRelationshipDelta: (delta: Relationship) => void;
  clearCumulativeRelationshipDelta: () => void; // Called on new chat

  gameAttributeCategories: GameAttributeCategory[];
  addGameAttributeCategory: (category: GameAttributeCategory) => void;
  updateGameAttributeCategory: (category: GameAttributeCategory) => void;
  deleteGameAttributeCategory: (id: string) => void;

  gameAttributes: GameAttribute[];
  addGameAttribute: (attribute: GameAttribute) => void;
  updateGameAttribute: (attribute: GameAttribute) => void;
  deleteGameAttribute: (id: string) => void;

  clearAllData: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, character]
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
      locations: [],
      addLocation: (location) => set((state) => ({
        locations: [...(state.locations || []), location] // Safety for existing state
      })),
      updateLocation: (updatedLocation) =>
        set((state) => ({
          locations: (state.locations || []).map((loc) =>
            loc.id === updatedLocation.id ? updatedLocation : loc
          ),
        })),
      deleteLocation: (id) =>
        set((state) => ({
          locations: (state.locations || []).filter((loc) => loc.id !== id),
        })),
      selectedChatLocation: undefined,
      setSelectedChatLocation: (location) => set({ selectedChatLocation: location }),
      selectedChatCharacter: undefined,
      setSelectedChatCharacter: (character) => set({ selectedChatCharacter: character }),
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
          selectedChatCharacter: undefined,
          cumulativeRelationshipDelta: undefined,
          characterGroups: [],
          locations: [],
          selectedChatLocation: undefined,
          gameAttributeCategories: [],
          gameAttributes: [],
        });
        useEntityStore.persist.clearStorage();
      },

      gameAttributeCategories: [],
      addGameAttributeCategory: (category) => set((state) => ({ gameAttributeCategories: [...(state.gameAttributeCategories || []), category] })),
      updateGameAttributeCategory: (updatedCategory) => set((state) => ({
        gameAttributeCategories: (state.gameAttributeCategories || []).map((cat) => cat.id === updatedCategory.id ? updatedCategory : cat)
      })),
      deleteGameAttributeCategory: (id) => set((state) => ({
        gameAttributeCategories: (state.gameAttributeCategories || []).filter((cat) => cat.id !== id)
      })),

      gameAttributes: [],
      addGameAttribute: (attribute) => set((state) => ({ gameAttributes: [...(state.gameAttributes || []), attribute] })),
      updateGameAttribute: (updatedAttribute) => set((state) => ({
        gameAttributes: (state.gameAttributes || []).map((attr) => attr.id === updatedAttribute.id ? updatedAttribute : attr)
      })),
      deleteGameAttribute: (id) => set((state) => ({
        gameAttributes: (state.gameAttributes || []).filter((attr) => attr.id !== id)
      })),

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'entity-store',
      storage: createJSONStorage(() => DexieStorageAdapter),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);

          // Use setTimeout to ensure we call setState after the store is fully initialized and hydrated,
          // otherwise React won't be notified of these migrations/default values.
          setTimeout(() => {
            useEntityStore.setState((prev) => {
              const updates: Partial<EntityStore> = {};
              let needsUpdate = false;

              // Ensure all characters have a relationships array and idealMatch
              if (prev.characters) {
                const updatedCharacters = prev.characters.map(character => {
                  let changed = false;
                  const newChar = { ...character };

                  if (!character.relationships) {
                    newChar.relationships = [];
                    changed = true;
                  } else {
                    newChar.relationships = character.relationships.map((rel: any) => ({
                      ...rel,
                      satisfaction: rel.satisfaction ?? 50,
                      commitment: rel.commitment ?? 50,
                      intimacy: rel.intimacy ?? 50,
                      trust: rel.trust ?? 50,
                      passion: rel.passion ?? 50
                    }));
                    // For simplicity, just assume we might have updated
                    changed = true;
                  }

                  if (!character.idealMatch) {
                    newChar.idealMatch = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
                    changed = true;
                  }

                  return changed ? newChar : character;
                });

                updates.characters = updatedCharacters;
                needsUpdate = true;
              }

              // Ensure default game attribute categories exist
              const defaultCategories: GameAttributeCategory[] = [
                { id: 'origins', name: 'Origins', description: 'Social Class / Starting Socioeconomic Background' },
                { id: 'education', name: 'Education', description: 'Education Level / Path' },
                { id: 'housing', name: 'Housing', description: 'Property / Housing Status' },
                { id: 'siblings', name: 'Siblings', description: 'Family size / Structure' },
                { id: 'relationships', name: 'Relationships', description: 'Relationship History / Trajectory' }
              ];

              const currentCategories = prev.gameAttributeCategories || [];
              const missingCategories = defaultCategories.filter(
                defCat => !currentCategories.some(cat => cat.id === defCat.id)
              );

              if (missingCategories.length > 0) {
                updates.gameAttributeCategories = [...currentCategories, ...missingCategories];
                needsUpdate = true;
              }

              if (!prev.gameAttributes) {
                updates.gameAttributes = [];
                needsUpdate = true;
              }

              return needsUpdate ? updates : {};
            });
          }, 0);
        }
      },
    }
  )
);
