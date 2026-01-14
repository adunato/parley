import { BioMachine } from '../lib/generator/BioMachine';
import { BioData, AgePhase, AGE_PHASES, EventNode, LifeEvent } from '../lib/generator/types';

// Mock Data
const mockData: BioData = {
    childhood: [
        { id: 'origin_child', slot: 'CHILDHOOD', text: 'Origin', weights: { DEFAULT: 10 }, phase: 'Childhood', provides: ['TAG_O'] }
    ],
    formative: [
        { id: 'edu_form', slot: 'FORMATIVE', text: 'Edu', weights: { DEFAULT: 10 }, phase: 'Formative', provides: ['TAG_E'], requires: ['TAG_Event'] }
    ],
    professional: [
        { id: 'job_prof', slot: 'PROFESSIONAL', text: 'Job', weights: { DEFAULT: 10 }, phase: 'Professional', provides: ['TAG_C'], requires: ['TAG_E'] }
    ],
    senior: [],
    lifeEvents: [
        { id: 'event_child', text: 'Childhood Event', weights: { DEFAULT: 100 }, phases: ['Childhood'], provides: ['TAG_Event'] }
    ],
    tags: [],
    groups: []
};

describe('BioMachine Phased Logic', () => {
    let machine: BioMachine;

    beforeEach(() => {
        machine = new BioMachine(mockData);
    });

    it('should select spine node for a specific phase', () => {
        const tags = new Set<string>();
        // @ts-ignore
        const origin = machine.resolvePhaseSpine('Childhood', tags);
        expect(origin).toBeDefined();
        expect(origin?.id).toBe('origin_child');
    });

    it('should respect requirements for spine selection', () => {
        const tags = new Set<string>();
        
        // @ts-ignore
        const edu = machine.resolvePhaseSpine('Formative', tags);
        
        expect(edu).toBeNull(); // Should fail requirements (missing TAG_Event)

        tags.add('TAG_Event');
        // @ts-ignore
        const eduSuccess = machine.resolvePhaseSpine('Formative', tags);
        expect(eduSuccess?.id).toBe('edu_form');
    });

    it('should simulate flesh events for a specific phase', () => {
        const tags = new Set<string>();
        const usedIds = new Set<string>();
        
        // @ts-ignore
        const events = machine.simulatePhaseFlesh('Childhood', tags, 18, usedIds);
        
        expect(Array.isArray(events)).toBe(true);
        if (events.length > 0) {
            events.forEach(e => {
                expect(e.phases).toContain('Childhood');
            });
        }
    });

    it('should not include events from other phases', () => {
         const tags = new Set<string>();
         const usedIds = new Set<string>();
         
         // @ts-ignore
         const events = machine.simulatePhaseFlesh('Childhood', tags, 18, usedIds);
         if (events.length > 0) {
             const hasFormative = events.some(e => e.id === 'event_form');
             expect(hasFormative).toBe(false);
         }
    });

    it('should generate a full bio using phased loop with interleaved dependencies', () => {
        // This tests that Childhood Events (providing TAG_Event) are processed BEFORE Formative Spine (requiring TAG_Event)

        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9); // Force events

        const result = machine.generate({ age: 30 });

        spy.mockRestore();

        // In new logic, this should pass.
        // In old logic, this should FAIL because Edu requires TAG_Event which comes from LifeEvent.
        // Old logic: Spine (All) -> Flesh (All). Edu checks tags at start. TAG_Event not present.

        const hasEdu = result.spine.some(s => s.slot === 'FORMATIVE');
        expect(hasEdu).toBe(true);
    });

    it('should respect pinning constraints (Backward Propagation)', () => {

        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9); // Force events

        // Add a dummy education that does NOT provide TAG_E
        const badEdu: EventNode = { id: 'edu_bad', slot: 'FORMATIVE', text: 'Bad Edu', weights: { DEFAULT: 100 }, phase: 'Formative', provides: ['TAG_X'] }; // High weight

        // Inject badEdu into machine
        // @ts-ignore
        machine.formative.push(badEdu);

        // Target job_prof (Requires TAG_E)
        const result = machine.generate({ age: 30, targetProfessionalId: 'job_prof' });

        spy.mockRestore();

        // Should NOT select edu_bad despite high weight, because it doesn't provide TAG_E required by job_prof
        const edu = result.spine.find(s => s.slot === 'FORMATIVE');
        expect(edu?.id).toBe('edu_form');
    });
});