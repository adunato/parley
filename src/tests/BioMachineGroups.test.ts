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
});
