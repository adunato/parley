import { generateSystemPrompt } from '../src/lib/prompts/chatPrompts';
import { Character, Persona, Relationship, PRQC } from '../src/lib/types';
import { DEFAULT_PROMPTS } from '../src/lib/store/promptStore';

// Mock Data
const mockCharacter: Character = {
    id: 'char1',
    basicInfo: { name: 'Eldrin', age: 100, gender: 'Male', role: 'Wizard', reputation: 'Respected', background: 'Scholar', firstImpression: 'Wise', appearance: 'Robes' },
    personality: { openness: 85, conscientiousness: 70, extraversion: 30, agreeableness: 60, neuroticism: 40 },
    idealMatch: { openness: 90, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 10 },
    relationships: []
};

const mockPersona: Persona = {
    id: 'persona1',
    basicInfo: { name: 'Kael', age: 25, gender: 'Male', role: 'Rogue', reputation: 'Notorious', background: 'Street Urchin', appearance: 'Leather Armor', firstImpression: 'Sneaky' }
};

const mockRelationship: Relationship = {
    characterId: 'char1',
    personaId: 'persona1',
    // High satisfaction to trigger "High" description
    satisfaction: 90,
    commitment: 50,
    intimacy: 20,
    trust: 10,
    passion: 60,
    description: "Initial meeting"
};

const template = DEFAULT_PROMPTS.chat_system.template;

// test
console.log("Generating System Prompt...");
const prompt = generateSystemPrompt(
    mockCharacter,
    mockPersona,
    mockRelationship,
    template,
    "A magical fantasy world.",
    "Speak in riddles."
);

// Verification Checks
const checks = [
    // 1. Check for Descriptive OCEAN (Openness 85 = Very High, Extraversion 30 = Low)
    { name: "OCEAN Descriptions", pass: prompt.includes("Visionary and constantly seeking the new") && prompt.includes("Reserved and observant") },

    // 2. Check for Descriptive PRQC (Satisfaction 90 = Very High, Intimacy 20 = Very Low)
    { name: "PRQC Descriptions", pass: prompt.includes("Extremely satisfied and joyous") && prompt.includes("Distant and guarded") },

    // 3. New Instructions Presence
    { name: "Persona Context Instructions", pass: prompt.includes("tailor your responses") && prompt.includes("Noble\" vs a \"Rogue") },
    { name: "Relationship Context Instructions", pass: prompt.includes("REFLECT this state, NOT change it") },

    // 4. Legacy Block Absence
    { name: "Legacy Instructions Removed", pass: !prompt.includes("Interpret the JSON as follows") && !prompt.includes("2. **PLAYER PERSONA DATA**:") }
];

let allPass = true;
checks.forEach(check => {
    if (check.pass) {
        console.log(`[PASS] ${check.name}`);
    } else {
        console.log(`[FAIL] ${check.name}`);
        allPass = false;
    }
});

if (allPass) {
    console.log("\n✅ All verifications passed!");
    process.exit(0);
} else {
    console.error("\n❌ Some verifications failed.");
    console.log("\n--- GENERATED PROMPT ---\n");
    console.log(prompt);
    process.exit(1);
}
