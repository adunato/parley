import { useParleyStore } from '../store';
import { useEntityStore } from '../entityStore';
import { useProjectLibraryStore, ProjectMetadata } from '../store/projectStore';
import { Character, CharacterGroup, Persona, Relationship } from '../types';
import { Message } from 'ai';

// --- Types ---
export interface ParleyProjectExport {
    version: number;
    timestamp: string;
    metadata: {
        name: string;
        description?: string;
    };
    world: {
        description: string;
        style: string;
    };
    entities: {
        characters: Character[];
        characterGroups: CharacterGroup[];
        playerPersonas: Persona[];
        relationshipDeltas: Relationship | undefined;
    };
    session: {
        chatMessages: Message[];
        chatSessionId: number;
        selectedCharacterId?: string;
        selectedPersonaId?: string;
    };
}

export interface ParleySettingsExport {
    version: number;
    timestamp: string;
    models: {
        chatModel: string;
        summarizationModel: string;
        generationModel: string;
    };
    avatarGeneration: {
        width: number;
        height: number;
        steps: number;
        cfg: number;
        negativePrompt: string;
        model: string;
        seed: number;
    };
    prompts: Record<string, string>;
    templates?: {
        systemPrompt: string;
    };
}

const PROJECT_STORAGE_PREFIX = 'parley_project_';

// --- Service Implementation ---

export const ProjectService = {

    // --- Core Project Management ---

    createNewProject: (name: string, description?: string): string => {
        const id = crypto.randomUUID();
        const newProject: ProjectMetadata = {
            id,
            name,
            description,
            lastModified: Date.now(),
        };

        // 1. Add to Library
        useProjectLibraryStore.getState().addProject(newProject);

        // 2. Clear Active State (Set to Defaults)
        useParleyStore.getState().clearAllData();
        useEntityStore.getState().clearAllData();

        // 3. Set as Current
        useProjectLibraryStore.getState().setCurrentProjectId(id);

        // 4. Persist Initial State
        ProjectService.saveProject(id);

        return id;
    },

    saveProject: (id: string) => {
        const parleyState = useParleyStore.getState();
        const entityState = useEntityStore.getState();

        const projectData: ParleyProjectExport = {
            version: 1,
            timestamp: new Date().toISOString(),
            metadata: {
                name: useProjectLibraryStore.getState().getProject(id)?.name || 'Untitled',
                description: useProjectLibraryStore.getState().getProject(id)?.description
            },
            world: {
                description: parleyState.worldDescription,
                style: parleyState.aiStyle,
            },
            entities: {
                characters: entityState.characters,
                characterGroups: entityState.characterGroups,
                playerPersonas: entityState.playerPersonas,
                relationshipDeltas: entityState.cumulativeRelationshipDelta,
            },
            session: {
                chatMessages: parleyState.chatMessages,
                chatSessionId: parleyState.chatSessionId,
                selectedCharacterId: entityState.selectedChatCharacter?.id,
                selectedPersonaId: entityState.selectedChatPersona?.id,
            }
        };

        try {
            localStorage.setItem(`${PROJECT_STORAGE_PREFIX}${id}`, JSON.stringify(projectData));
            useProjectLibraryStore.getState().updateProject(id, { lastModified: Date.now() });
        } catch (e) {
            console.error("Failed to save project. Quota might be exceeded.", e);
            throw new Error("Failed to save project.");
        }
    },

    loadProject: (id: string) => {
        const dataString = localStorage.getItem(`${PROJECT_STORAGE_PREFIX}${id}`);
        if (!dataString) {
            throw new Error(`Project data for ID ${id} not found.`);
        }

        try {
            const data: ParleyProjectExport = JSON.parse(dataString);

            // Hydrate Stores
            const parleyStore = useParleyStore.getState();
            const entityStore = useEntityStore.getState();

            // Parley Store
            parleyStore.setWorldDescription(data.world.description);
            parleyStore.setAiStyle(data.world.style);
            parleyStore.setChatMessages(data.session.chatMessages);
            parleyStore.clearChat();

            // Entity Store
            entityStore.clearAllData();
            useEntityStore.setState({
                characters: data.entities.characters,
                characterGroups: data.entities.characterGroups,
                playerPersonas: data.entities.playerPersonas,
                cumulativeRelationshipDelta: data.entities.relationshipDeltas,
                selectedChatCharacter: data.entities.characters.find(c => c.id === data.session.selectedCharacterId),
                selectedChatPersona: data.entities.playerPersonas.find(p => p.id === data.session.selectedPersonaId)
            });

            // Set Current ID
            useProjectLibraryStore.getState().setCurrentProjectId(id);

        } catch (e) {
            console.error("Failed to load project", e);
            throw new Error("Failed to parse project data.");
        }
    },

    deleteProject: (id: string) => {
        useProjectLibraryStore.getState().deleteProject(id);
        localStorage.removeItem(`${PROJECT_STORAGE_PREFIX}${id}`);
    },

    // --- Import / Export ---

    exportProjectToJSON: (id: string): string => {
        // Ensure we have latest saved state
        ProjectService.saveProject(id);
        const dataString = localStorage.getItem(`${PROJECT_STORAGE_PREFIX}${id}`);
        if (!dataString) throw new Error("Project data empty");
        return dataString;
    },

    importProjectFromJSON: async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string) as ParleyProjectExport;

                    if (!json.entities || !json.world) {
                        throw new Error("Invalid Project File");
                    }

                    const newId = crypto.randomUUID();
                    let name = json.metadata.name;
                    const existingName = useProjectLibraryStore.getState().projects.find(p => p.name === name);
                    if (existingName) name = `${name} (Imported)`;

                    const newProject: ProjectMetadata = {
                        id: newId,
                        name: name,
                        description: json.metadata.description,
                        lastModified: Date.parse(json.timestamp) || Date.now()
                    };

                    localStorage.setItem(`${PROJECT_STORAGE_PREFIX}${newId}`, JSON.stringify(json));
                    useProjectLibraryStore.getState().addProject(newProject);
                    resolve(newId);

                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    // --- Settings Management ---

    exportSettingsToJSON: async (): Promise<string> => {
        const store = useParleyStore.getState();

        let promptsExport: Record<string, string> = {};
        try {
            const res = await fetch('/api/settings/prompts');
            if (res.ok) {
                const configs = await res.json();
                Object.keys(configs).forEach(key => {
                    promptsExport[key] = configs[key].template;
                });
            } else {
                console.error("Failed to fetch prompts for export");
            }
        } catch (e) {
            console.error("Error exporting prompts", e);
        }

        const settings: ParleySettingsExport = {
            version: 1,
            timestamp: new Date().toISOString(),
            models: {
                chatModel: store.chatModel,
                summarizationModel: store.summarizationModel,
                generationModel: store.generationModel,
            },
            avatarGeneration: store.avatarGenerationSettings,
            prompts: promptsExport
        };
        return JSON.stringify(settings, null, 2);
    },

    importSettingsFromJSON: async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string) as ParleySettingsExport;

                    if (!json.models || !json.avatarGeneration) {
                        throw new Error("Invalid Settings File");
                    }

                    const store = useParleyStore.getState();
                    // Sync Store
                    store.setChatModel(json.models.chatModel);
                    store.setSummarizationModel(json.models.summarizationModel);
                    store.setGenerationModel(json.models.generationModel);
                    store.setAvatarGenerationSettings(json.avatarGeneration);

                    // Import Prompts
                    if (json.prompts) {
                        for (const [id, template] of Object.entries(json.prompts)) {
                            await fetch('/api/settings/prompts', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id, template })
                            });
                        }

                        // Sync chat_system to store cache if present
                        if (json.prompts['chat_system']) {
                            store.setSystemPromptTemplate(json.prompts['chat_system']);
                        }
                    } else if (json.templates?.systemPrompt) {
                        // Legacy fallback
                        store.setSystemPromptTemplate(json.templates.systemPrompt);
                        await fetch('/api/settings/prompts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: 'chat_system', template: json.templates.systemPrompt })
                        });
                    }

                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    // --- Migration ---

    checkForLegacyData: () => {
        const library = useProjectLibraryStore.getState().projects;
        if (library.length > 0) return;

        const entityState = useEntityStore.getState();
        const parleyState = useParleyStore.getState();

        const hasData = entityState.characters.length > 0 ||
            parleyState.worldDescription.length > 0 ||
            parleyState.chatMessages.length > 0;

        if (hasData) {
            console.log("Legacy data detected. Migrating to 'Default World'.");
            const newId = crypto.randomUUID();
            const defaultProject: ProjectMetadata = {
                id: newId,
                name: "Default World",
                lastModified: Date.now(),
                description: "Auto-migrated from previous version."
            };

            useProjectLibraryStore.getState().addProject(defaultProject);
            ProjectService.saveProject(newId);
            useProjectLibraryStore.getState().setCurrentProjectId(newId);
        }
    }
};
