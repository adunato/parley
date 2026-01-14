import { BioGroup, BioData, EventNode } from '../lib/generator/types';

describe('Bio Group Types', () => {
    it('should allow creating a BioGroup', () => {
        const group: BioGroup = {
            id: 'group-1',
            name: 'Test Group',
            description: 'A test group'
        };
        expect(group.id).toBe('group-1');
    });

    it('should allow assigning a group to an EventNode', () => {
        const node: EventNode = {
            id: 'node-1',
            slot: 'CHILDHOOD',
            text: 'Test Node',
            weights: { DEFAULT: 1 },
            groupId: 'group-1'
        };
        expect(node.groupId).toBe('group-1');
    });

    it('should allow adding groups to BioData', () => {
        const data: BioData = {
            childhood: [],
            formative: [],
            professional: [],
            senior: [],
            lifeEvents: [],
            tags: [],
            groups: [
                { id: 'g1', name: 'G1' }
            ]
        };
        expect(data.groups).toHaveLength(1);
    });
});