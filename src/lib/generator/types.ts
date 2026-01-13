
// --- Types ---

export type SlotType = 'ORIGIN' | 'EDUCATION' | 'CAREER';

export type AgePhase = 'Childhood' | 'Formative' | 'Professional' | 'Senior';

export interface PhaseConfig {
    id: AgePhase;
    startAge: number;
    endAge: number;
    simulationInterval: number;
    eventChance: number;
    spineSlot: SlotType | null;
}

export const AGE_PHASES: Record<AgePhase, PhaseConfig> = {
    Childhood: {
        id: 'Childhood',
        startAge: 0,
        endAge: 18,
        simulationInterval: 5,
        eventChance: 0.3,
        spineSlot: 'ORIGIN'
    },
    Formative: {
        id: 'Formative',
        startAge: 18,
        endAge: 25,
        simulationInterval: 2,
        eventChance: 0.4,
        spineSlot: 'EDUCATION'
    },
    Professional: {
        id: 'Professional',
        startAge: 25,
        endAge: 65,
        simulationInterval: 5,
        eventChance: 0.5,
        spineSlot: 'CAREER'
    },
    Senior: {
        id: 'Senior',
        startAge: 65,
        endAge: 100,
        simulationInterval: 5,
        eventChance: 0.4,
        spineSlot: null
    }
};

export interface EventNode {
    id: string;
    slot: SlotType;
    text: string;
    requires?: string[];
    provides?: string[];
    weights: { [tag: string]: number; "DEFAULT": number };
    phase?: AgePhase; // Associated Age Phase
}

export interface LifeEvent {
    id: string;
    text: string;
    requires?: string[];
    provides?: string[];
    weights: { [tag: string]: number; "DEFAULT": number };
    phases?: AgePhase[]; // Associated Age Phases
}

export interface Tag {
    id: string;
    description?: string;
}

export interface BioGenerationRequest {
    targetCareerId?: string; // Pinning constraint
    targetOriginId?: string; // Pinning constraint
    age?: number;
}

export interface BioState {
    spine: EventNode[];
    flesh: LifeEvent[];
    tags: Set<string>;
    age: number;
}

// Data Bundle definition (for dependency injection)
export interface BioData {
    origins: EventNode[];
    education: EventNode[];
    careers: EventNode[];
    lifeEvents: LifeEvent[];
    tags: Tag[];
}
