import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';

export interface BioDatasetMetadata {
    id: string;
    name: string;
    description?: string;
    lastModified: number;
}

interface BioLibraryStore {
    datasets: BioDatasetMetadata[];
    currentDatasetId: string | null;

    addDataset: (dataset: BioDatasetMetadata) => void;
    updateDataset: (id: string, updates: Partial<BioDatasetMetadata>) => void;
    deleteDataset: (id: string) => void;
    setCurrentDatasetId: (id: string | null) => void;
    getDataset: (id: string) => BioDatasetMetadata | undefined;
}

export const useBioLibraryStore = create<BioLibraryStore>()(
    persist(
        (set, get) => ({
            datasets: [],
            currentDatasetId: null,

            addDataset: (dataset) => set((state) => ({
                datasets: [...state.datasets, dataset]
            })),

            updateDataset: (id, updates) => set((state) => ({
                datasets: state.datasets.map(d =>
                    d.id === id ? { ...d, ...updates } : d
                )
            })),

            deleteDataset: (id) => set((state) => ({
                datasets: state.datasets.filter(d => d.id !== id),
                currentDatasetId: state.currentDatasetId === id ? null : state.currentDatasetId
            })),

            setCurrentDatasetId: (id) => set({ currentDatasetId: id }),

            getDataset: (id) => get().datasets.find(d => d.id === id),
        }),
        {
            name: 'parley-bio-library',
            storage: createJSONStorage(() => DexieStorageAdapter),
        }
    )
);
