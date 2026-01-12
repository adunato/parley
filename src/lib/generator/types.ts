
// --- Types ---

export type SlotType = 'ORIGIN' | 'EDUCATION' | 'CAREER';

export interface EventNode {
    id: string;
    slot: SlotType;
    text: string;
    requires?: string[];
    provides?: string[];
    weights: { [tag: string]: number; "DEFAULT": number };
}

export interface LifeEvent {
    id: string;
    text: string;
    requires?: string[];
    provides?: string[];
    weights: { [tag: string]: number; "DEFAULT": number };
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
