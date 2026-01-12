import { BioMachine } from '../lib/generator/BioMachine';
import { BioData, EventNode, LifeEvent } from '../lib/generator/types';

describe('BioMachine', () => {
    const mockData: BioData = {
        origins: [
            { id: 'origin_1', slot: 'ORIGIN', text: 'Origin 1', provides: ['TAG_A'], weights: { DEFAULT: 1 } }
        ],
        education: [
            { id: 'edu_1', slot: 'EDUCATION', text: 'Edu 1', requires: ['TAG_A'], provides: ['TAG_B'], weights: { DEFAULT: 1 } }
        ],
        careers: [
            { id: 'career_1', slot: 'CAREER', text: 'Career 1', requires: ['TAG_B'], weights: { DEFAULT: 1 } }
        ],
        lifeEvents: [
            { id: 'event_no_req', text: 'No Req', weights: { DEFAULT: 1 } },
            { id: 'event_req_a', text: 'Req A', requires: ['TAG_A'], weights: { DEFAULT: 1 } },
            { id: 'event_req_c', text: 'Req C', requires: ['TAG_C'], weights: { DEFAULT: 1 } }
        ],
        tags: []
    };

    it('should filter life events based on requirements', () => {
        // Mock Math.random to always be high probability for event trigger (0.9 > 0.3)
        // and low enough to not affect selectWeighted in a bad way
        const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.9);
        
        const machine = new BioMachine(mockData);
        // By generating with high age, we trigger more flesh simulation chunks
        const result = machine.generate({ age: 100 });

        const eventIds = result.flesh.map(e => e.id);

        mockRandom.mockRestore();

        // event_no_req should always be possible
        // event_req_a should be possible because origin_1 provides TAG_A
        // event_req_c should NOT be possible because TAG_C is never provided

        expect(eventIds).toContain('event_no_req');
        expect(eventIds).toContain('event_req_a');
        expect(eventIds).not.toContain('event_req_c');
    });

    it('should respect requires field in spine nodes (baseline check)', () => {
        const machine = new BioMachine(mockData);
        const result = machine.generate({ age: 25 });

        expect(result.spine.map(n => n.id)).toEqual(['origin_1', 'edu_1', 'career_1']);
        expect(result.tags.has('TAG_A')).toBe(true);
        expect(result.tags.has('TAG_B')).toBe(true);
    });
});
