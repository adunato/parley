import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';
import { EventNode, LifeEvent, SlotType, Tag } from '../generator/types';

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
    tags: Tag[];

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

    addTag: (item: Tag) => void;
    updateTag: (item: Tag, oldId?: string) => void;
    deleteTag: (id: string) => void;

    setData: (data: {
        origins: EventNode[];
        education: EventNode[];
        careers: EventNode[];
        lifeEvents: LifeEvent[];
        tags: Tag[];
    }) => void;

    // Computed
    getAllData: () => {
        origins: EventNode[];
        education: EventNode[];
        careers: EventNode[];
        lifeEvents: LifeEvent[];
        tags: Tag[];
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
            tags: [],

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

            addTag: (item) => set((state) => ({ tags: [...state.tags, item] })),
            updateTag: (item, oldId) => set((state) => {
                const effectiveOldId = oldId || item.id;
                const isRename = effectiveOldId !== item.id;

                if (!isRename) {
                    return {
                        tags: state.tags.map(i => i.id === item.id ? item : i)
                    };
                }

                // Cascading Rename Logic
                const renameInList = (list: any[], field: 'provides' | 'requires') => 
                    list.map(obj => ({
                        ...obj,
                        [field]: obj[field]?.map((t: string) => t === effectiveOldId ? item.id : t)
                    }));

                const renameInWeights = (list: any[]) =>
                    list.map(obj => {
                        if (!obj.weights || obj.weights[effectiveOldId] === undefined) return obj;
                        const newWeights = { ...obj.weights };
                        newWeights[item.id] = newWeights[effectiveOldId];
                        delete newWeights[effectiveOldId];
                        return { ...obj, weights: newWeights };
                    });

                return {
                    tags: state.tags.map(i => i.id === effectiveOldId ? item : i),
                    origins: renameInList(state.origins, 'provides'),
                    education: renameInWeights(renameInList(renameInList(state.education, 'provides'), 'requires')),
                    careers: renameInWeights(renameInList(state.careers, 'requires')),
                    lifeEvents: renameInWeights(renameInList(state.lifeEvents, 'provides'))
                };
            }),
            deleteTag: (id) => set((state) => ({
                tags: state.tags.filter(i => i.id !== id)
            })),

            // Bulk Set (for migration)
            setData: (data) => set(data),

            getAllData: () => ({
                origins: get().origins,
                education: get().education,
                careers: get().careers,
                lifeEvents: get().lifeEvents,
                tags: get().tags
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
                    const { origins, education, careers, tags } = state;
                    
                    // 1. Seed default data if empty
                    if (origins.length === 0 && education.length === 0 && careers.length === 0) {
                        console.log("BioStore: Migrating default data...");
                        state.setData({
                            origins: originsData as EventNode[],
                            education: educationData as EventNode[],
                            careers: careersData as EventNode[],
                            lifeEvents: eventsData as LifeEvent[],
                            tags: [] // Will be populated in next step
                        });
                    }

                    // 2. Harvest Tags Migration (If tags are empty but other data exists)
                    // We check state again because setData above might have just run
                    if ((state.tags || []).length === 0 && (state.origins.length > 0 || state.education.length > 0)) {
                        console.log("BioStore: Harvesting tags from entities...");
                        const uniqueTags = new Set<string>();
                        
                        const collect = (list: any[]) => {
                            list.forEach(item => {
                                item.provides?.forEach((t: string) => uniqueTags.add(t));
                                item.requires?.forEach((t: string) => uniqueTags.add(t));
                                if (item.weights) {
                                    Object.keys(item.weights).forEach(t => {
                                        if (t !== "DEFAULT") uniqueTags.add(t);
                                    });
                                }
                            });
                        };

                        collect(state.origins);
                        collect(state.education);
                        collect(state.careers);
                        collect(state.lifeEvents);

                        const newTags = Array.from(uniqueTags).map(id => ({ id }));
                        state.setData({
                            ...state.getAllData(),
                            tags: newTags
                        });
                    }

                    state.setHasHydrated(true);
                }
            },
        }
    )
);
