import {create} from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import {Message} from '@ai-sdk/react';
import {Character, Persona} from './types';

export interface Relationship {
    characterId: string;
    personaId: string;
    closeness: number;
    sexual_attraction: number;
    respect: number;
    engagement: number;
    stability: number;
    description: string;
    chat_summaries?: ChatSummary[]; // Made optional with ?
}

export interface ChatSummary {
    summary: string;
    timestamp: Date;
}

interface ParleyStore {
    gameInitialized: boolean;
    initializeGame: () => void;
    characters: Character[];
    addCharacter: (character: Character) => void;
    updateCharacter: (character: Character) => void;
    deleteCharacter: (id: string) => void;
    playerPersonas: Persona[];
    addPlayerPersona: (persona: Persona) => void;
    updatePlayerPersona: (persona: Persona) => void;
    deletePlayerPersona: (id: string) => void;
    worldDescription: string;
    setWorldDescription: (description: string) => void;
    aiStyle: string;
    setAiStyle: (style: string) => void;
    selectedChatCharacter?: Character;
    setSelectedChatCharacter: (character: Character | undefined) => void;
    selectedChatPersona?: Persona;
    setSelectedChatPersona: (persona: Persona | undefined) => void;
    chatMessages: Message[];
    setChatMessages: (messages: Message[]) => void;
    chatInput: string;
    setChatInput: (input: string) => void;
    clearChat: () => void;
    _hasHydrated: boolean;
    _setHasHydrated: (hydrated: boolean) => void;
    chatSessionId: number;
    clearCharacters: () => void;
    clearAllData: () => void;
    cumulativeRelationshipDelta?: Relationship; // Optional: Stores cumulative deltas for the current chat session
    updateCumulativeRelationshipDelta: (delta: Relationship) => void;
    clearCumulativeRelationshipDelta: () => void; // Called on new chat
    chatModel: string;
    setChatModel: (model: string) => void;
    summarizationModel: string;
    setSummarizationModel: (model: string) => void;
    generationModel: string;
    setGenerationModel: (model: string) => void;
}

export const useParleyStore = create<ParleyStore>()(
    devtools(
        persist(
            (set, get) => ({
                gameInitialized: false,

                initializeGame: () => set({gameInitialized: true}),
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
                addPlayerPersona: (persona) => set((state) => ({playerPersonas: [...state.playerPersonas, persona]})),
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
                worldDescription: '',
                setWorldDescription: (description) => set({worldDescription: description}),
                aiStyle: '',
                setAiStyle: (style) => set({aiStyle: style}),
                selectedChatCharacter: undefined,
                setSelectedChatCharacter: (character) => set({selectedChatCharacter: character}),
                selectedChatPersona: undefined,
                setSelectedChatPersona: (persona) => set({selectedChatPersona: persona}),
                chatMessages: [],
                setChatMessages: (messages) => set({chatMessages: messages}),
                chatInput: '',
                setChatInput: (input) => set({chatInput: input}),
                clearChat: () => set((state) => {
                    const prevChatSessionId = state.chatSessionId;
                    localStorage.removeItem(`ai-sdk:chat:main-chat-${prevChatSessionId}`);
                    const newChatSessionId = state.chatSessionId + 1;
                    return {
                        selectedChatCharacter: undefined,
                        selectedChatPersona: undefined,
                        chatMessages: [],
                        chatInput: '',
                        chatSessionId: newChatSessionId,
                    };
                }),
                _setHasHydrated: (hydrated) => set({_hasHydrated: hydrated}),
                chatSessionId: 0,
                _hasHydrated: false,
                clearCharacters: () => set({characters: []}),
                clearAllData: () => {
                    set({
                        gameInitialized: false,
                        characters: [],
                        playerPersonas: [],
                        worldDescription: '',
                        aiStyle: '',
                        selectedChatCharacter: undefined,
                        selectedChatPersona: undefined,
                        chatMessages: [],
                        chatInput: '',
                        chatSessionId: 0,
                        cumulativeRelationshipDelta: undefined, // Clear cumulative delta on full data clear
                    });
                    useParleyStore.persist.clearStorage();
                },
                cumulativeRelationshipDelta: undefined,
                updateCumulativeRelationshipDelta: (delta: Relationship) =>
                    set((state) => {
                        const currentDelta = state.cumulativeRelationshipDelta;
                        if (currentDelta) {
                            return {
                                cumulativeRelationshipDelta: {
                                    ...currentDelta,
                                    closeness: currentDelta.closeness + delta.closeness,
                                    sexual_attraction: currentDelta.sexual_attraction + delta.sexual_attraction,
                                    respect: currentDelta.respect + delta.respect,
                                    engagement: currentDelta.engagement + delta.engagement,
                                    stability: currentDelta.stability + delta.stability,
                                    description: `${currentDelta.description}\n${delta.description}`,
                                },
                            };
                        } else {
                            return {cumulativeRelationshipDelta: delta};
                        }
                    }),
                clearCumulativeRelationshipDelta: () => set({cumulativeRelationshipDelta: undefined}),
                chatModel: '',
                setChatModel: (model) => set({chatModel: model}),
                summarizationModel: '',
                setSummarizationModel: (model) => set({summarizationModel: model}),
                generationModel: '',
                setGenerationModel: (model) => set({generationModel: model}),
            }),
            {
                name: 'parley-storage',
                storage: {
                    getItem: (name) => {
                        const item = localStorage.getItem(name);
                        return item ? JSON.parse(item) : null;
                    },
                    setItem: (name, value) => {
                        localStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name);
                    },
                },
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        // Ensure all characters have a relationships array
                        if (state.characters) {
                            state.characters = state.characters.map(character => ({
                                ...character,
                                relationships: character.relationships || []
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
                    state?._setHasHydrated(true);
                },
            }),
        {
            serialize: {
                options: true,
                replacer: (_key, value) => {
                    if (value instanceof Map) {
                        return {dataType: 'Map', value: Array.from(value.entries())};
                    }
                    return value;
                },
            },
        }
    )
);