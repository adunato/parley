// src/lib/types.ts

export interface OriginLocation {
  country?: string;
  stateRegion?: string;
  town?: string;
}

export interface BasicInfo {
  name: string;
  age: number;
  gender: string;
  role: string;
  faction: string;
  reputation: string;
  background: string;
  firstImpression: string;
  appearance: string;
  avatar?: string;
  siblings?: string;
  originLocation?: OriginLocation;
  mappedAttributes?: Record<string, string>; // categoryId -> attributeId
}

export interface Personality {
  /** An integer between 0 (Very Low) and 100 (Very High) */
  openness: number;
  /** An integer between 0 (Very Low) and 100 (Very High) */
  conscientiousness: number;
  /** An integer between 0 (Very Low) and 100 (Very High) */
  extraversion: number;
  /** An integer between 0 (Very Low) and 100 (Very High) */
  agreeableness: number;
  /** An integer between 0 (Very Low) and 100 (Very High) */
  neuroticism: number;
}

export type OCEAN = Personality;

export interface PRQC {
  satisfaction: number;
  commitment: number;
  intimacy: number;
  trust: number;
  passion: number;
}

export interface Character {
  id: string;
  basicInfo: BasicInfo;
  personality: Personality;

  locationId?: string;
  idealMatch: Personality;
  relationships: Relationship[];
}

export interface Persona {
  id: string;
  basicInfo: BasicInfo;
}

export interface Relationship {
  characterId: string;
  personaId: string;
  satisfaction: number;
  commitment: number;
  intimacy: number;
  trust: number;
  passion: number;
  description: string;
  chat_summaries?: ChatSummary[]; // Made optional with ?
}

export interface ChatSummary {
  summary: string;
  timestamp: Date;
}

export interface ProfessionSlot {
  id: string; // Unique ID for the slot
  professionId: string; // The required profession
  characterId?: string; // The character assigned to this slot (optional)
}

export interface Location {
  id: string;
  name: string;
  description: string;
  image?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  professionSlots?: ProfessionSlot[];
}

export interface CharacterGroup {
  id: string;
  name: string;
  characters: string[];
  description: string;
}

export interface BaseGameEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string; // Dynamic for generic attributes, 'profession' for Professions
}

export interface Profession extends BaseGameEntity {
  categoryId: 'profession';
  minAge: number;
  maxAge: number;
}

export interface GameAttributeCategory {
  id: string;
  name: string;
  description: string;
}

export interface GameAttribute extends BaseGameEntity {
  // Uses dynamic categoryId from GameAttributeCategory
}