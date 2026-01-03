import { Character, Relationship } from '../types';
import { InstructionCatalogue, OCEAN, PRQC } from './rules';

export function GenerateSystemPrompt(character: Character, relationship: Relationship): string {
    const ocean: OCEAN = character.personality;

    // Map Relationship to PRQC
    // We ensure to map explictly to avoid issues if Relationship has extra fields
    const prqc: PRQC = {
        satisfaction: relationship.satisfaction,
        commitment: relationship.commitment,
        intimacy: relationship.intimacy,
        trust: relationship.trust,
        passion: relationship.passion
    };

    const instructions: string[] = [];

    for (const rule of InstructionCatalogue) {
        try {
            if (rule.condition(ocean, prqc)) {
                instructions.push(rule.instruction);
            }
        } catch (error) {
            console.error(`Error evaluating rule ${rule.id}:`, error);
        }
    }

    return instructions.join('\n');
}
