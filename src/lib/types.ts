// src/lib/types.ts

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

export interface Location {
  id: string;
  name: string;
  description: string;
  image?: string;
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface CharacterGroup {
  id: string;
  name: string;
  characters: string[];
  description: string;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
}