import { BioMachine } from '../src/lib/generator/BioMachine';
import { NameGenerator } from '../src/lib/generator/NameGenerator';

import originsData from '../src/lib/generator/data/origins.json';
import educationData from '../src/lib/generator/data/education.json';
import careersData from '../src/lib/generator/data/careers.json';
import eventsData from '../src/lib/generator/data/events.json';
import { EventNode, LifeEvent } from '../src/lib/generator/types';

async function runTests() {
    console.log("=== Testing NameGenerator ===");
    console.log("USA:", NameGenerator.generateIdentity('USA'));
    console.log("Japan:", NameGenerator.generateIdentity('Japan'));
    console.log("France:", NameGenerator.generateIdentity('France'));

    console.log("\n=== Testing BioMachine ===");
    const machine = new BioMachine({
        origins: originsData as EventNode[],
        education: educationData as EventNode[],
        careers: careersData as EventNode[],
        lifeEvents: eventsData as LifeEvent[]
    });

    console.log("\n--- Test 1: Random Generation ---");
    const resultRandom = machine.generate({ age: 25 });
    console.log("Spine:", resultRandom.spine.map(n => n.id).join(' -> '));
    console.log("Flesh:", resultRandom.flesh.map(e => e.id));
    console.log("Tags:", Array.from(resultRandom.tags));

    console.log("\n--- Test 2: Pinning Career (Investment Banker) ---");
    const resultBanker = machine.generate({ targetCareerId: 'investment_banker', age: 40 });
    console.log("Spine:", resultBanker.spine.map(n => n.id).join(' -> '));
    console.log("Requirements Check (investment_banker requires DEGREE_ADVANCED):");
    const hasDegree = resultBanker.tags.has('DEGREE_ADVANCED');
    console.log(`Has Degree: ${hasDegree ? 'PASS' : 'FAIL'}`);

    console.log("\n--- Test 3: Pinning Origin (Old Money) ---");
    const resultOldMoney = machine.generate({ targetOriginId: 'old_money', age: 30 });
    console.log("Spine:", resultOldMoney.spine.map(n => n.id).join(' -> '));
    console.log("Origin Check (Starts with old_money):");
    const isOldMoney = resultOldMoney.spine[0].id === 'old_money';
    console.log(`Is Old Money: ${isOldMoney ? 'PASS' : 'FAIL'}`);
}

runTests().catch(console.error);
