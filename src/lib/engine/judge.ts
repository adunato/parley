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

        // Calculate Multiplier (Signed Magnitude and Direction)
        const multiplier = SensitivityMatrix.getMultiplier(idealMatchVal, traitScore);

        // 2. Routing (What does this trait affect?)
        const targets = RoutingTable[traitName] || RoutingTable[traitName.charAt(0).toUpperCase() + traitName.slice(1).toLowerCase()];

        if (!targets) {
            // Trait not in routing table (maybe "Funny" or "Smart"?)
            continue;
        }

        // 3. Delta Calculation
        // Logic: TraitScore (0-1) * SignedMultiplier (-1.0 to 1.0) * BaseScalingFactor
        const BASE_SCALING = 5;

        // Note: The multiplier now handles direction (Positive for Match, Negative for Mismatch)

        const deltaVal = Math.round(traitScore * multiplier * BASE_SCALING);

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
