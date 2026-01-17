
import { EventNode, LifeEvent, AgePhase } from '../lib/generator/types';

describe('Schema Updates', () => {
    it('should support phase assignment on EventNode', () => {
        const node: EventNode = {
            id: 'test_node',
            slot: 'CHILDHOOD',
            text: 'Test Node',
            weights: { "DEFAULT": 1 },
            phase: 'Childhood' // This should be valid
        };
        expect(node.phase).toBe('Childhood');
    });

    it('should support multiple phase assignment on LifeEvent', () => {
        const event: LifeEvent = {
            id: 'test_event',
            text: 'Test Event',
            weights: { "DEFAULT": 1 },
            phases: ['Childhood', 'Formative'] // This should be valid
        };
        expect(event.phases).toContain('Childhood');
        expect(event.phases).toContain('Formative');
    });
});
