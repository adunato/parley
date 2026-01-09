import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';

export interface ProjectMetadata {
    id: string;
    name: string;
    description?: string;
    lastModified: number;
}

interface ProjectLibraryStore {
    projects: ProjectMetadata[];
    currentProjectId: string | null;

    addProject: (project: ProjectMetadata) => void;
    updateProject: (id: string, updates: Partial<ProjectMetadata>) => void;
    deleteProject: (id: string) => void;
    setCurrentProjectId: (id: string | null) => void;
    getProject: (id: string) => ProjectMetadata | undefined;
}

export const useProjectLibraryStore = create<ProjectLibraryStore>()(
    persist(
        (set, get) => ({
            projects: [],
            currentProjectId: null,

            addProject: (project) => set((state) => ({
                projects: [...state.projects, project]
            })),

            updateProject: (id, updates) => set((state) => ({
                projects: state.projects.map(p =>
                    p.id === id ? { ...p, ...updates } : p
                )
            })),

            deleteProject: (id) => set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
            })),

            setCurrentProjectId: (id) => set({ currentProjectId: id }),

            getProject: (id) => get().projects.find(p => p.id === id),
        }),
        {
            name: 'parley-project-library',
            storage: createJSONStorage(() => DexieStorageAdapter),
        }
    )
);
