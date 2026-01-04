import { JudgeScene } from '../src/lib/engine/judge';
import { SceneReport } from '../src/lib/engine/analyst';
import { Character, PRQC } from '../src/lib/types';

// Mock Data
const mockStats: PRQC = {
    satisfaction: 50,
    commitment: 50,
    intimacy: 50,
    trust: 50,
    passion: 50
};

const mockCharacter: Character = {
    id: 'char1',
    basicInfo: { name: 'Alice', age: 25, gender: 'F', role: 'test', faction: 'test', reputation: 'test', background: 'test', firstImpression: 'test', appearance: 'test' },
    personality: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },

    idealMatch: {
        openness: 90, // Loves Openness
        conscientiousness: 10, // Hates Conscientiousness
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 10 // Hates Neuroticism
    },
    relationships: []
};

// Scenario 1: User is Open (Match)
const reportMatch: SceneReport = {
    scene_id: 'test1',
    aggregate_traits: {
        "Openness": 0.8
    },
    major_events: []
};

// Scenario 2: User is Conscientious (Mismatch)
const reportMismatch: SceneReport = {
    scene_id: 'test2',
    aggregate_traits: {
        "Conscientiousness": 0.8
    },
    major_events: []
};

// Scenario 3: User is Aggressive (Negative Trait)
const reportNegative: SceneReport = {
    scene_id: 'test3',
    aggregate_traits: {
        "Aggression": 0.8
    },
    major_events: []
};

console.log("--- TEST 1: Openness Match (Ideal 90, User 0.8) ---");
const result1 = JudgeScene(mockStats, reportMatch, mockCharacter);
console.log(result1.description);
console.log(result1.delta);

console.log("\n--- TEST 2: Conscientiousness Mismatch (Ideal 10, User 0.8) ---");
const result2 = JudgeScene(mockStats, reportMismatch, mockCharacter);
console.log(result2.description);
console.log(result2.delta);

console.log("\n--- TEST 3: Aggression (Negative) ---");
const result3 = JudgeScene(mockStats, reportNegative, mockCharacter);
console.log(result3.description);
console.log(result3.delta);
