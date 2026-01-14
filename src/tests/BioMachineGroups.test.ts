import { BioMachine } from '../lib/generator/BioMachine';
import { BioData, EventNode } from '../lib/generator/types';

describe('BioMachine Groups', () => {
    const mockData: BioData = {
        childhood: [
            { id: 'c1', slot: 'CHILDHOOD', text: 'C1', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA' },
            { id: 'c2', slot: 'CHILDHOOD', text: 'C2', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA' },
            { id: 'c3', slot: 'CHILDHOOD', text: 'C3', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupB' },
            { id: 'c4', slot: 'CHILDHOOD', text: 'C4', weights: { DEFAULT: 1 }, phase: 'Childhood' }, // Ungrouped
        ],
        formative: [],
        professional: [],
        senior: [],
        lifeEvents: [],
        tags: [],
        groups: [
            { id: 'groupA', name: 'Group A' },
            { id: 'groupB', name: 'Group B' }
        ]
    };

    it('should select one node per group in a phase', () => {
        const machine = new BioMachine(mockData);
        const result = machine.generate({ age: 18 });

        // Expected: 3 spine nodes (one from groupA, one from groupB, one from ungrouped)
        // Current implementation will return only 1.
        expect(result.spine.length).toBe(3);
        
        const ids = result.spine.map(s => s.id);
        expect(ids).toContain('c3'); // Group B only has one option
        expect(ids).toContain('c4'); // Ungrouped only has one option
        expect(ids.some(id => id === 'c1' || id === 'c2')).toBe(true); // One from Group A
    });

    it('should maintain selection independence within a phase', () => {
        const dependentData: BioData = {
            ...mockData,
            childhood: [
                { id: 'c1', slot: 'CHILDHOOD', text: 'C1', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA', provides: ['TAG1'] },
                { id: 'c2', slot: 'CHILDHOOD', text: 'C2', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupB', requires: ['TAG1'] },
            ]
        };

        const machine = new BioMachine(dependentData);
        const result = machine.generate({ age: 18 });

        // c2 requires TAG1. c1 provides TAG1.
        // Since they are in the same phase, c2 should NOT be selectable because it can't see TAG1 yet.
        expect(result.spine.find(s => s.id === 'c2')).toBeUndefined();
        expect(result.spine.find(s => s.id === 'c1')).toBeDefined();
    });

    it('should provide aggregate tags from all groups to flesh simulation in the same phase', () => {
        const fleshData: BioData = {
            ...mockData,
            childhood: [
                { id: 'c1', slot: 'CHILDHOOD', text: 'C1', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA', provides: ['TAG_A'] },
                { id: 'c2', slot: 'CHILDHOOD', text: 'C2', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupB', provides: ['TAG_B'] },
            ],
            lifeEvents: [
                { 
                    id: 'event_requires_both', 
                    text: 'Requires Both', 
                    weights: { DEFAULT: 100 }, 
                    phases: ['Childhood'], 
                    requires: ['TAG_A', 'TAG_B'] 
                }
            ]
        };

        const machine = new BioMachine(fleshData);
        
        // Force event trigger
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
        
        const result = machine.generate({ age: 18 });
        
        spy.mockRestore();

        // The event requires BOTH tags. If flesh simulation runs after all groups are resolved,
        // it should see both TAG_A and TAG_B and thus select the event.
        const event = result.flesh.find(e => e.id === 'event_requires_both');
        expect(event).toBeDefined();
    });

    it('should NOT prune nodes from unrelated groups during backward propagation', () => {
        const backPropData: BioData = {
            ...mockData,
            formative: [
                { id: 'edu_med', slot: 'FORMATIVE', text: 'Med School', weights: { DEFAULT: 1 }, phase: 'Formative', groupId: 'education', provides: ['DEGREE_MED'] },
                { id: 'edu_art', slot: 'FORMATIVE', text: 'Art School', weights: { DEFAULT: 1 }, phase: 'Formative', groupId: 'education', provides: ['DEGREE_ART'] },
                { id: 'social_club', slot: 'FORMATIVE', text: 'Social Club', weights: { DEFAULT: 1 }, phase: 'Formative', groupId: 'social', provides: ['FRIENDS'] }
            ],
            professional: [
                { id: 'job_doc', slot: 'PROFESSIONAL', text: 'Doctor', weights: { DEFAULT: 1 }, phase: 'Professional', requires: ['DEGREE_MED'] }
            ]
        };

        const machine = new BioMachine(backPropData);
        
        // Pinning the Doctor career, which requires DEGREE_MED
        const result = machine.generate({ age: 30, targetProfessionalId: 'job_doc' });

        // Expectation:
        // 1. 'edu_med' should be selected for 'education' group (to satisfy Doctor).
        // 2. 'social_club' should STILL be selected for 'social' group (it shouldn't be pruned just because it doesn't help with Doctor).
        
        const spineIds = result.spine.map(s => s.id);
        expect(spineIds).toContain('edu_med');
        expect(spineIds).toContain('social_club');
    });

    it('should respect pinning constraints while allowing other groups to resolve', () => {
        const pinData: BioData = {
            ...mockData,
            childhood: [
                { id: 'origin_A', slot: 'CHILDHOOD', text: 'Origin A', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA' },
                { id: 'origin_B', slot: 'CHILDHOOD', text: 'Origin B', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupA' }, // Competitor
                { id: 'family_1', slot: 'CHILDHOOD', text: 'Family 1', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'groupFamily' } // Different Group
            ]
        };

        const machine = new BioMachine(pinData);
        
        // Pin 'origin_B'.
        // Expected:
        // 1. 'origin_B' is selected for groupA (replacing chance of origin_A).
        // 2. 'family_1' is STILL selected for groupFamily (should not be filtered out).
        const result = machine.generate({ age: 18, targetChildhoodId: 'origin_B' });
        
        const spineIds = result.spine.map(s => s.id);
        expect(spineIds).toContain('origin_B');
        expect(spineIds).toContain('family_1');
    });
});
