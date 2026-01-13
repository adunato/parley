
import { AgePhase, AGE_PHASES } from '../lib/generator/types';

describe('AgePhase Types and Constants', () => {
    it('should define the correct AgePhase values', () => {
        const phases: AgePhase[] = ['Childhood', 'Formative', 'Professional', 'Senior'];
        expect(phases).toHaveLength(4);
    });

    it('should define AGE_PHASES configuration with correct defaults', () => {
        expect(AGE_PHASES).toBeDefined();
        
        // Childhood
        expect(AGE_PHASES.Childhood).toEqual({
            id: 'Childhood',
            startAge: 0,
            endAge: 18,
            simulationInterval: 5,
            eventChance: 0.3,
            spineSlot: 'ORIGIN'
        });

        // Formative
        expect(AGE_PHASES.Formative).toEqual({
            id: 'Formative',
            startAge: 18,
            endAge: 25,
            simulationInterval: 2,
            eventChance: 0.4,
            spineSlot: 'EDUCATION'
        });

        // Professional
        expect(AGE_PHASES.Professional).toEqual({
            id: 'Professional',
            startAge: 25,
            endAge: 65,
            simulationInterval: 5,
            eventChance: 0.5,
            spineSlot: 'CAREER'
        });

        // Senior
        expect(AGE_PHASES.Senior).toEqual({
            id: 'Senior',
            startAge: 65,
            endAge: 100, // or generic max
            simulationInterval: 5,
            eventChance: 0.4,
            spineSlot: 'SENIOR'
        });
    });
});
