import { BioMachine } from '../src/lib/generator/BioMachine';
import { NameGenerator } from '../src/lib/generator/NameGenerator';

import childhoodData from '../src/lib/generator/data/childhood.json';
import formativeData from '../src/lib/generator/data/formative.json';
import professionalData from '../src/lib/generator/data/professional.json';
import eventsData from '../src/lib/generator/data/events.json';
import { EventNode, LifeEvent } from '../src/lib/generator/types';

// Mock Data Bundle
const mockData = {
    childhood: childhoodData as EventNode[],
    formative: formativeData as EventNode[],
    professional: professionalData as EventNode[],
    senior: [] as EventNode[],
    lifeEvents: eventsData as LifeEvent[],
    tags: [], // Not needed for basic generation test
    groups: []
};

async function testGenerator() {
    console.log("--- Starting Bio Generator Test ---");

    const machine = new BioMachine(mockData);

    console.log("\n--- Test 1: Random Generation ---");
    const resultRandom = machine.generate({ age: 30 });
    console.log("Spine:", resultRandom.spine.map(n => n.id));
    console.log("Flesh Events:", resultRandom.flesh.length);
    console.log("Tags:", Array.from(resultRandom.tags));

    console.log("\n--- Test 2: Pinning Professional (Investment Banker) ---");
    const resultBanker = machine.generate({ targetProfessionalId: 'investment_banker', age: 40 });
    const careerNode = resultBanker.spine.find(n => n.slot === 'PROFESSIONAL');
    console.log("Professional Check:", careerNode?.id);
    if (careerNode?.id !== 'investment_banker') {
        console.error("FAILED: Did not pin career.");
    } else {
        console.log("SUCCESS: Career pinned.");
    }

    console.log("\n--- Test 3: Pinning Childhood (Old Money) ---");
    const resultOldMoney = machine.generate({ targetChildhoodId: 'old_money', age: 30 });
    const originNode = resultOldMoney.spine.find(n => n.slot === 'CHILDHOOD');
    console.log("Childhood Check (Starts with old_money):");
    console.log(originNode?.id);
    
    // Check flow
    console.log("Full Spine:", resultOldMoney.spine.map(n => n.id));

    console.log("\n--- Test 4: Identity Generation ---");
    const identity = NameGenerator.generateIdentity('USA', 'female');
    console.log("Generated:", identity);

    console.log("\n--- Done ---");
}

testGenerator().catch(console.error);