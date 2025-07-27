import {create} from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import {Message} from '@ai-sdk/react';

interface ChatSummary {
    summary: string;
    timestamp: Date;
}

interface ParleyStore {
    gameInitialized: boolean;
    initializeGame: () => void;
    worldDescription: string;
    setWorldDescription: (description: string) => void;
    aiStyle: string;
    setAiStyle: (style: string) => void;
    chatMessages: Message[];
    setChatMessages: (messages: Message[]) => void;
    chatInput: string;
    setChatInput: (input: string) => void;
    clearChat: () => void;
    _hasHydrated: boolean;
    _setHasHydrated: (hydrated: boolean) => void;
    chatSessionId: number;
    clearAllData: () => void;
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
                worldDescription: '',
                setWorldDescription: (description) => set({worldDescription: description}),
                aiStyle: '',
                setAiStyle: (style) => set({aiStyle: style}),
                chatMessages: [],
                setChatMessages: (messages) => set({chatMessages: messages}),
                chatInput: '',
                setChatInput: (input) => set({chatInput: input}),
                clearChat: () => set((state) => {
                    const prevChatSessionId = state.chatSessionId;
                    localStorage.removeItem(`ai-sdk:chat:main-chat-${prevChatSessionId}`);
                    const newChatSessionId = state.chatSessionId + 1;
                    return {
                        chatMessages: [],
                        chatInput: '',
                        chatSessionId: newChatSessionId,
                    };
                }),
                _setHasHydrated: (hydrated) => set({_hasHydrated: hydrated}),
                chatSessionId: 0,
                _hasHydrated: false,
                clearAllData: () => {
                    set({
                        gameInitialized: false,
                        worldDescription: '',
                        aiStyle: '',
                        chatMessages: [],
                        chatInput: '',
                        chatSessionId: 0,
                    });
                    useParleyStore.persist.clearStorage();
                },
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
