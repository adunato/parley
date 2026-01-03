import { PRQC, Character, OCEAN } from '../types';
import { SceneReport } from './analyst';
import { RoutingTable, SensitivityMatrix } from './math';

export interface JudgeResult {
    delta: PRQC;
    description: string;
    applied_traits: string[];
}

export function JudgeScene(
    currentStats: PRQC,
    sceneReport: SceneReport,
    character: Character
): JudgeResult {
    const totalDelta: PRQC = {
        satisfaction: 0,
        commitment: 0,
        intimacy: 0,
        trust: 0,
        passion: 0
    };

    const descriptions: string[] = [];
    const appliedTraits: string[] = [];

    // Iterate over each trait found in the Scene Report
    for (const [traitName, traitScore] of Object.entries(sceneReport.aggregate_traits)) {
        // 1. Get Multiplier (How much does the Character care?)
        // Map traitName to IdealMatch key if possible (e.g. "Openness" -> idealMatch.openness)
        // Or just generic "trait" if not in OCEAN.

        let idealMatchVal: number | undefined = undefined;

        // Attempt to find trait in IdealMatch (OCEAN)
        // capitalization check: OCEAN keys are lowercase in our type, but likely Title Case from Analyst.
        const normalizedKey = traitName.toLowerCase() as keyof OCEAN;
        if (character.idealMatch && normalizedKey in character.idealMatch) {
            // idealMatch values are 0-100, we need 0-1.
            idealMatchVal = character.idealMatch[normalizedKey] / 100;
        }

        // Calculate Multiplier
        // We pass the traitScore (0-1) and idealMatchVal (0-1)
        const multiplier = SensitivityMatrix.getMultiplier(idealMatchVal, traitScore);

        // 2. Routing (What does this trait affect?)
        const targets = RoutingTable[traitName] || RoutingTable[traitName.charAt(0).toUpperCase() + traitName.slice(1).toLowerCase()];

        if (!targets) {
            // Trait not in routing table (maybe "Funny" or "Smart"?)
            // We could have a default routing or ignore.
            continue;
        }

        // 3. Delta Calculation
        // Logic: TraitScore (0-1) * Multiplier (1-2) * BaseScalingFactor
        // Let's say a Strong Trait (0.8) with High Multiplier (1.5) should give +5 to stats?
        const BASE_SCALING = 5;

        // But wait, is it positive or negative?
        // Analyst output "Aggression: 0.8". 
        // If IdealMatch has Aggression: 0.9 (Loves it) -> Positive impact.
        // If IdealMatch has Aggression: 0.1 (Hates it) -> Negative impact?
        // The SensitivityMatrix in math.ts only returned a Magnitude Multiplier 1.0 - 2.0.
        // It didn't handle direction. We need to handle direction here.

        let direction = 1;

        // If it's an OCEAN trait, direction depends on Ideal Match.
        // If Ideal is High (>50) and Trait is High -> Good.
        // If Ideal is Low (<50) and Trait is High -> Bad.
        if (idealMatchVal !== undefined) {
            if (Math.abs(idealMatchVal - traitScore) > 0.5) {
                // Large gap -> Negative impact? 
                // E.g. Ideal 0.9, Trait 0.1 (Not present) -> Low impact anyway (Score is low).
                // E.g. Ideal 0.1, Trait 0.9 (Present but unwanted) -> Gap is 0.8. Negative!
                direction = -1;
            }
        } else {
            // Non-OCEAN traits (e.g. "Dishonesty"). 
            // We must assume mapped defaults. 
            // "Dishonesty" usually negative. "Support" usually positive.
            // This is tricky without a "Trait Metadata" table.
            // For now, let's hardcode a few negative ones or assume positive unless known bad.
            const NEGATIVE_TRAITS = ["Aggression", "Dishonesty", "Betrayal", "Insult", "Neuroticism"];
            if (NEGATIVE_TRAITS.includes(traitName) || NEGATIVE_TRAITS.includes(traitName.charAt(0).toUpperCase() + traitName.slice(1))) {
                direction = -1;
            }
        }

        const deltaVal = Math.round(traitScore * multiplier * BASE_SCALING * direction);

        if (deltaVal === 0) continue;

        // Apply to targets
        targets.forEach(target => {
            totalDelta[target] += deltaVal;
        });

        appliedTraits.push(`${traitName} (${deltaVal > 0 ? '+' : ''}${deltaVal})`);
    }

    // Append Major Events to descriptions
    if (sceneReport.major_events && sceneReport.major_events.length > 0) {
        descriptions.push(...sceneReport.major_events);
    }

    // Summary of stat changes (The "Table" of PRQC Deltas)
    const impactSummary: string[] = [];
    for (const [key, value] of Object.entries(totalDelta)) {
        if (value !== 0) {
            impactSummary.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value > 0 ? '+' : ''}${value}`);
        }
    }

    if (impactSummary.length > 0) {
        descriptions.push(`\nRELATIONSHIP UPDATE:\n${impactSummary.join('\n')}`);
    } else {
        descriptions.push(`\nRELATIONSHIP UPDATE:\nNo significant changes.`);
    }

    return {
        delta: totalDelta,
        description: descriptions.join('\n'), // Events + PRQC Summary
        applied_traits: appliedTraits
    };
}
