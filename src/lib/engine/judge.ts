import { PRQC } from '../types';
import { Signal, SignalCategory } from './analyst';

export interface JudgeResult {
    delta: PRQC;
    description: string;
}

const BASE_DELTAS: Record<SignalCategory, Partial<PRQC>> = {
    'FLIRT': { satisfaction: 1, passion: 2, intimacy: 1 },
    'INSULT': { satisfaction: -5, trust: -5, passion: -2, commitment: -2 },
    'COMPLIMENT': { satisfaction: 2, passion: 1 },
    'AGREE': { satisfaction: 1, trust: 1 },
    'DISAGREE': { satisfaction: -1 }, // Healthy disagreement is minor
    'GIFT_SMALL': { satisfaction: 3, commitment: 1 },
    'GIFT_LARGE': { satisfaction: 10, commitment: 5, trust: 2 },
    'REVEAL_SECRET': { intimacy: 5, trust: 5, commitment: 2 },
    'BETRAYAL': { trust: -20, satisfaction: -10, commitment: -10, passion: -5 },
    'SACRIFICE': { trust: 10, commitment: 10, intimacy: 5, passion: 5 },
    'DEMAND': { satisfaction: -2, trust: -1 }
};

export function JudgeTurn(
    currentStats: PRQC,
    signals: Signal[]
): JudgeResult {
    const totalDelta: PRQC = {
        satisfaction: 0,
        commitment: 0,
        intimacy: 0,
        trust: 0,
        passion: 0
    };

    const descriptions: string[] = [];

    for (const signal of signals) {
        const base = BASE_DELTAS[signal.category];
        if (!base) continue;

        // Apply weight multiplier (1-5)
        // We use a simple 0.5 + (weight * 0.5) multiplier? 
        // Or just direct multiplication? 
        // Let's say weight 3 is standard (1.0x).
        // 1 = 0.5x
        // 5 = 2.0x
        const multiplier = signal.weight <= 0 ? 1 : (0.5 + (signal.weight * 0.2)); // 1->0.7, 3->1.1, 5->1.5. Let's tweak.
        // Simple: 1=0.5, 2=0.75, 3=1.0, 4=1.25, 5=1.5
        const mult = 0.25 + (signal.weight * 0.25);

        if (base.satisfaction) totalDelta.satisfaction += Math.round(base.satisfaction * mult);
        if (base.commitment) totalDelta.commitment += Math.round(base.commitment * mult);
        if (base.intimacy) totalDelta.intimacy += Math.round(base.intimacy * mult);
        if (base.trust) totalDelta.trust += Math.round(base.trust * mult);
        if (base.passion) totalDelta.passion += Math.round(base.passion * mult);

        descriptions.push(`${signal.category} (${signal.reasoning})`);
    }

    // Special Logic: Initimacy Gating
    // If you FLIRT but Intimacy is low (<20), it might backfire or be less effective.
    // For now, let's just keep it simple math.

    return {
        delta: totalDelta,
        description: descriptions.length > 0 ? descriptions.join('; ') : "No significant impact."
    };
}
