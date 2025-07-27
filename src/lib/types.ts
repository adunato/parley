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
}

export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface Character {
  id: string;
  basicInfo: BasicInfo;
  personality: Personality;
  preferences: {
    attractedToTraits: string[];
    dislikesTraits: string[];
    gossipTendency: "low" | "medium" | "high";
  };
  relationships: Relationship[];
}

export interface Persona {
  id: string;
  basicInfo: BasicInfo;
}

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

export interface CharacterGroup {
  id: string;
  name: string;
  characters: string[];
  description: string;
}