import { PRQC } from '../types';

/**
 * RoutingTable maps a behavioral trait (OCEAN-like or custom) to the specific
 * relationship components (PRQC) it influences.
 */
export const RoutingTable: Record<string, (keyof PRQC)[]> = {
    // OCEAN Traits
    "Openness": ["intimacy", "satisfaction"],
    "Conscientiousness": ["trust", "commitment"],
    "Extraversion": ["passion", "satisfaction"],
    "Agreeableness": ["satisfaction", "trust"],
    "Neuroticism": ["satisfaction", "commitment"], // Often negative impact if high

    // Specific Behaviors (mapped from Analyst output)
    "Aggression": ["trust", "satisfaction", "commitment"],
    "Flirtation": ["passion", "intimacy"],
    "Support": ["commitment", "satisfaction", "trust"],
    "Vulnerability": ["intimacy", "trust"],
    "Dishonesty": ["trust", "satisfaction", "commitment"],
    "Generosity": ["satisfaction", "commitment"]
};

/**
 * SensitivityMatrix provides the logic to calculate how much impact a trait has,
 * based on the Character's preferences (Ideal Match).
 */
export const SensitivityMatrix = {
    /**
     * Calculates a multiplier for the relationship impact.
     * 
     * Logic:
     * - If the Character WANTS this trait (High Ideal Match), and User PROVIDES it (High Trait):
     *   -> High Multiplier (Reward)
     * - If the Character HATES this trait (Low Ideal Match), and User PROVIDES it (High Trait):
     *   -> High Negative Multiplier (Punishment) - *Handled by the Judge applying the sign*
     * 
     * Actually, the Judge handles the direction (Increase/Decrease).
     * This function should return a MAGNITUDE multiplier based on "Relevance".
     * 
     * Let's refine the HLD logic:
     * "Impact is driven by how well the user fits the character's *type*."
     * 
     * If IdealMatch = 0.9 (Loves it) and UserTrait = 0.8 (Has it) -> Match! Impact = High Positive.
     * If IdealMatch = 0.9 (Loves it) and UserTrait = 0.2 (Lacks it) -> Mismatch! Impact = Negative? 
     * 
     * Let's simplify: Return a multiplier that scales with the *intensity* of the user's trait, 
     * modulated by the character's *sensitivity* to it.
     * 
     * @param idealMatchVal The character's preference (0-1). 
     *                      If undefined, assume neutral (0.5).
     * @param userTraitVal The measure of the trait in the user's behavior (0-1).
     * 
     * @returns A multiplier (e.g., 0.5 to 2.0).
     */
    getMultiplier: (idealMatchVal: number | undefined, userTraitVal: number): number => {
        const ideal = idealMatchVal ?? 0.5;

        // Base impact is determined by how strong the user's behavior was.
        // UserTrait 0.1 (Low) -> Low Impact
        // UserTrait 0.9 (High) -> High Impact
        // But we need to know if this is a "Good" or "Bad" thing.
        // The Analyst just says "Openness: 0.8". 
        // Code usually implies High Openness is "More Open".

        // Let's defer "Good/Bad" judgment to the Judge logic using this multiplier.
        // This function just tells us "How much does the character CARE?"

        // If Ideal is Extreme (0 or 1), they care A LOT.
        // If Ideal is Neutral (0.5), they don't care much.

        const sensitivity = Math.abs(ideal - 0.5) * 2; // 0->1, 0.5->0, 1->1

        // Base multiplier 1.0 + up to 1.0 bonus for sensitivity.
        return 1.0 + sensitivity;
    }
};
