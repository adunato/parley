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
    "Support": ["commitment", "satisfaction", "trust"]
};

/**
 * SensitivityMatrix provides the logic to calculate how much impact a trait has,
 * based on the Character's preferences (Ideal Match).
 */
export const SensitivityMatrix = {
    /**
     * Calculates a signed multiplier for the relationship impact.
     * 
     * Logic:
     * - "Signed Alignment" formula: 1.0 - (2.0 * Distance)
     * - Distance = |Ideal - User|
     * 
     * Examples:
     * - Perfect Match (Ideal 0.9, User 0.9): Distance 0.0 -> 1.0 - 0.0 = +1.0 (Positive Impact)
     * - Neutral (Ideal 0.5, User 0.5): Distance 0.0 -> +1.0 ... Wait.
     * - Opposites (Ideal 0.9, User 0.1): Distance 0.8 -> 1.0 - 1.6 = -0.6 (Negative Impact)
     * 
     * @param idealMatchVal The character's preference (0-1). 
     *                      If undefined, assume neutral (0.5).
     * @param userTraitVal The measure of the trait in the user's behavior (0-1).
     * 
     * @returns A signed multiplier (e.g., -1.0 to 1.0).
     */
    getMultiplier: (idealMatchVal: number | undefined, userTraitVal: number): number => {
        const ideal = idealMatchVal ?? 0.5;
        const distance = Math.abs(ideal - userTraitVal);

        // Signed Alignment Formula
        // Distance 0 -> 1.0
        // Distance 0.5 -> 0.0
        // Distance 1.0 -> -1.0
        return 1.0 - (2.0 * distance);
    }
};
