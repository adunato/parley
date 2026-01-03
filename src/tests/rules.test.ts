import { InstructionCatalogue, OCEAN, PRQC } from '../lib/engine/rules';

describe('InstructionCatalogue', () => {
    const mockOCEAN: OCEAN = {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
    };

    const mockPRQC: PRQC = {
        satisfaction: 50,
        commitment: 50,
        intimacy: 50,
        trust: 50,
        passion: 50,
    };

    test('High Openness trigger', () => {
        const rule = InstructionCatalogue.find(r => r.id === 'ocean_openness_high');
        expect(rule).toBeDefined();

        // Test True Condition
        const highMatch = { ...mockOCEAN, openness: 80 };
        expect(rule!.condition(highMatch, mockPRQC)).toBe(true);

        // Test False Condition
        const lowMatch = { ...mockOCEAN, openness: 20 };
        expect(rule!.condition(lowMatch, mockPRQC)).toBe(false);

        // Verify Instruction Text
        expect(rule!.instruction).toContain("concepts over details");
    });

    test('Low Openness trigger', () => {
        const rule = InstructionCatalogue.find(r => r.id === 'ocean_openness_low');
        expect(rule).toBeDefined();

        const lowMatch = { ...mockOCEAN, openness: 20 };
        expect(rule!.condition(lowMatch, mockPRQC)).toBe(true);

        const highMatch = { ...mockOCEAN, openness: 80 };
        expect(rule!.condition(highMatch, mockPRQC)).toBe(false);
    });

    test('High Trust trigger', () => {
        const rule = InstructionCatalogue.find(r => r.id === 'prqc_trust_high');
        expect(rule).toBeDefined();

        const highTrust = { ...mockPRQC, trust: 80 };
        expect(rule!.condition(mockOCEAN, highTrust)).toBe(true);

        const lowTrust = { ...mockPRQC, trust: 20 };
        expect(rule!.condition(mockOCEAN, lowTrust)).toBe(false);
    });
});
