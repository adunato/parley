
import { create } from 'zustand';
import type { GameState, Choice } from '@/app/types';
import { useEntityStore, Character } from '@/lib/entityStore';

interface GameStore {
  story: string;
  imageUrl: string;
  choices: Choice[];
  storySummary: string;
  lastSceneDescription?: string;
  lastDialogue?: string;
  currentLocationId: string;
  inConversation: boolean;
  currentCharacterId?: string;
  isLoading: string | null;
  error: string | null;
  gameStarted: boolean;
  _hasInitialized: boolean;
  makeChoice: (choice: string) => Promise<void>;
  initializeGame: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  story: '',
  imageUrl: '',
  choices: [],
  storySummary: '',
  lastSceneDescription: undefined,
  lastDialogue: undefined,
  currentLocationId: 'start_location',
  inConversation: false,
  currentCharacterId: undefined,
  isLoading: null,
  error: null,
  gameStarted: false,
  _hasInitialized: false,
  makeChoice: async (choice: string) => {
    set({ isLoading: 'Processing your choice...', error: null });
    const { storySummary, currentLocationId, inConversation, currentCharacterId, lastSceneDescription, lastDialogue } = get();
    const { characters, addCharacter } = useEntityStore.getState();

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice, storySummary, currentLocationId, inConversation, currentCharacterId, lastSceneDescription, lastDialogue, characters }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }

      const data: GameState = await response.json();

      // Update entity store with any new characters returned by the server
      if (data.characters) {
        for (const charId in data.characters) {
          if (!characters[charId]) {
            addCharacter(data.characters[charId]);
          }
        }
      }

      set((state) => ({
        story: data.story,
        imageUrl: data.imageUrl,
        choices: data.choices,
        storySummary: data.storySummary,
        lastSceneDescription: data.lastSceneDescription,
        lastDialogue: data.lastDialogue,
        currentLocationId: data.currentLocationId,
        inConversation: data.inConversation,
        currentCharacterId: data.currentCharacterId,
        isLoading: null,
        gameStarted: choice === 'start' ? true : state.gameStarted,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: null });
    }
  },
  initializeGame: async () => {
    const { _hasInitialized } = get();
    if (_hasInitialized) {
      return;
    }
    set({ _hasInitialized: true, isLoading: 'Initializing game...', error: null });
    get().makeChoice('start');
  },
}));
