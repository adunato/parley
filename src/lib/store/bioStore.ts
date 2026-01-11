import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';
import { EventNode, LifeEvent, SlotType } from '../generator/types';

// Default Data Imports
import originsData from '../generator/data/origins.json';
import educationData from '../generator/data/education.json';
import careersData from '../generator/data/careers.json';
import eventsData from '../generator/data/events.json';

interface BioStoreState {
    origins: EventNode[];
    education: EventNode[];
    careers: EventNode[];
    lifeEvents: LifeEvent[];

    // Actions
    addOrigin: (item: EventNode) => void;
    updateOrigin: (item: EventNode) => void;
    deleteOrigin: (id: string) => void;

    addEducation: (item: EventNode) => void;
    updateEducation: (item: EventNode) => void;
    deleteEducation: (id: string) => void;

    addCareer: (item: EventNode) => void;
    updateCareer: (item: EventNode) => void;
    deleteCareer: (id: string) => void;

    addLifeEvent: (item: LifeEvent) => void;
    updateLifeEvent: (item: LifeEvent) => void;
    deleteLifeEvent: (id: string) => void;

    setData: (data: {
        origins: EventNode[];
        education: EventNode[];
        careers: EventNode[];
        lifeEvents: LifeEvent[];
    }) => void;

    // Computed
    getAllData: () => {
        origins: EventNode[];
        education: EventNode[];
        careers: EventNode[];
        lifeEvents: LifeEvent[];
    };

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useBioStore = create<BioStoreState>()(
    persist(
        (set, get) => ({
            origins: [],
            education: [],
            careers: [],
            lifeEvents: [],

            addOrigin: (item) => set((state) => ({ origins: [...state.origins, item] })),
            updateOrigin: (item) => set((state) => ({
                origins: state.origins.map(i => i.id === item.id ? item : i)
            })),
            deleteOrigin: (id) => set((state) => ({
                origins: state.origins.filter(i => i.id !== id)
            })),

            addEducation: (item) => set((state) => ({ education: [...state.education, item] })),
            updateEducation: (item) => set((state) => ({
                education: state.education.map(i => i.id === item.id ? item : i)
            })),
            deleteEducation: (id) => set((state) => ({
                education: state.education.filter(i => i.id !== id)
            })),

            addCareer: (item) => set((state) => ({ careers: [...state.careers, item] })),
            updateCareer: (item) => set((state) => ({
                careers: state.careers.map(i => i.id === item.id ? item : i)
            })),
            deleteCareer: (id) => set((state) => ({
                careers: state.careers.filter(i => i.id !== id)
            })),

            addLifeEvent: (item) => set((state) => ({ lifeEvents: [...state.lifeEvents, item] })),
            updateLifeEvent: (item) => set((state) => ({
                lifeEvents: state.lifeEvents.map(i => i.id === item.id ? item : i)
            })),
            deleteLifeEvent: (id) => set((state) => ({
                lifeEvents: state.lifeEvents.filter(i => i.id !== id)
            })),

            // Bulk Set (for migration)
            setData: (data) => set(data),

            getAllData: () => ({
                origins: get().origins,
                education: get().education,
                careers: get().careers,
                lifeEvents: get().lifeEvents
            }),

            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'parley-bio-config',
            storage: createJSONStorage(() => DexieStorageAdapter),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Check if empty and migrate
                    const { origins, education, careers } = state;
                    if (origins.length === 0 && education.length === 0 && careers.length === 0) {
                        console.log("BioStore: Migrating default data...");
                        // Use action to update state cleanly
                        state.setData({
                            origins: originsData as EventNode[],
                            education: educationData as EventNode[],
                            careers: careersData as EventNode[],
                            lifeEvents: eventsData as LifeEvent[]
                        });
                    }

                    state.setHasHydrated(true);
                }
            },
        }
    )
);
