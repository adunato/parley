import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Message } from '@ai-sdk/react';

interface ChatSummary {
    summary: string;
    timestamp: Date;
}

export interface AvatarGenerationSettings {
    width: number;
    height: number;
    steps: number;
    cfg: number;
    negativePrompt: string;
    model: string;
    seed: number;
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
    avatarGenerationSettings: AvatarGenerationSettings;
    setAvatarGenerationSettings: (settings: Partial<AvatarGenerationSettings>) => void;
    systemPromptTemplate: string;
    setSystemPromptTemplate: (template: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
}

export type Theme = 'light' | 'dark' | 'demiplane-light' | 'demiplane-dark';

export const useParleyStore = create<ParleyStore>()(
    devtools(
        persist(
            (set, get) => ({
                gameInitialized: false,

                initializeGame: () => set({ gameInitialized: true }),
                worldDescription: '',
                setWorldDescription: (description) => set({ worldDescription: description }),
                aiStyle: '',
                setAiStyle: (style) => set({ aiStyle: style }),
                chatMessages: [],
                setChatMessages: (messages) => set({ chatMessages: messages }),
                chatInput: '',
                setChatInput: (input) => set({ chatInput: input }),
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
                _setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
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
                setChatModel: (model) => set({ chatModel: model }),
                summarizationModel: '',
                setSummarizationModel: (model) => set({ summarizationModel: model }),
                generationModel: '',
                setGenerationModel: (model: string) => set({ generationModel: model }),
                avatarGenerationSettings: {
                    width: 1024,
                    height: 1024,
                    steps: 25,
                    cfg: 8,
                    negativePrompt: 'bad quality, low resolution, blurry',
                    model: 'epicrealismXL_vxiiiAb3ast.safetensors',
                    seed: -1, // -1 means random
                },
                setAvatarGenerationSettings: (settings) => set((state) => ({
                    avatarGenerationSettings: { ...state.avatarGenerationSettings, ...settings }
                })),
                systemPromptTemplate: `You are simulating an NPC in a narrative-driven RPG world. Your task is to fully roleplay {{characterName}} based on the structured data provided below.

--- CHARACTER IDENTITY ---
{{characterBasicInfo}}
Use the character's basicInfo (name, role, faction, reputation, background, firstImpression, appearance) to define their identity and how they present themselves.
--------------------------

--- CHARACTER PERSONALITY ---
{{characterPersonality}}
Use the personality (OCEAN model) traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) to shape speech patterns, decision-making, and emotional responses.
-----------------------------

--- CHARACTER IDEAL MATCH ---
{{characterIdealMatch}}
Use the ideal match traits to determine romantic compatibility.
-----------------------------

--- PLAYER PERSONA DATA ---
{{persona}}
---------------------------

--- RELATIONSHIP DATA [how {{characterName}} feels about {{personaName}}] ---
{{relationship}}
---------------------------

{{world}}

{{style}}

{{summaries}}

--- ACTING INSTRUCTIONS ---
{{instructions}}
---------------------------

Interpret the JSON as follows:



2. **PLAYER PERSONA DATA**:
   - This data describes the player's in-game persona. Understand who the player is in this world (their name, alias, reputation, background, role, faction, appearance, firstImpression).
   - Your responses should be tailored to this player persona. For example, if {{personaName}} persona has a "rogue" role, you might react with suspicion or admiration depending on your character's traits.

3. **RELATIONSHIP DATA**:
   - This data describes how {{characterName}} feels about {{personaName}}.
   - Use the **PRQC metrics** (Satisfaction, Commitment, Intimacy, Trust, Passion) to drive emotional tone and disposition.
   - **Satisfaction**: How happy they are with the relationship.
   - **Commitment**: How likely they are to stick around.
   - **Intimacy**: How much they share personal feelings.
   - **Trust**: How much they believe the player.
   - **Passion**: How physically/romantically attracted they are.
   - Use the description to understand the context.
   - The character reactions should always be consistent with their current relationship data. You should not try to change the character's emotional tone, trust levels, or overall disposition based on the player's actions or dialogue.

--- EMERGENCY SAFETY ---
If the user performs an act of extreme violence, non-consensual sexual acts, or confesses a major secret that fundamentally changes the narrative, you MUST append the following token to your response:
[EVENT: TRIGGER_ASSESSMENT]

Your job is to embody the character consistently. Stay **in-character**, do **not refer to the JSON**, and do not break immersion. Respond naturally and dynamically based on how the player interacts, always considering their persona.

If {{personaName}} acts in a way that aligns with your character’s personality, or their persona is favorable to your character, respond positively. If they act in opposition (e.g. their persona is unfavorable), respond accordingly. You can shift your attitude over time if justified.`,
                setSystemPromptTemplate: (template) => set({ systemPromptTemplate: template }),
                theme: 'dark',
                setTheme: (theme) => set({ theme }),
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
                        return { dataType: 'Map', value: Array.from(value.entries()) };
                    }
                    return value;
                },
            },
        }
    )
);
