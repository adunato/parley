import { create } from 'zustand';

interface ParleyStore {
  gameInitialized: boolean;
  initializeGame: () => void;
}

export const useParleyStore = create<ParleyStore>((set) => ({
  gameInitialized: false,
  initializeGame: () => set({ gameInitialized: true }),
}));