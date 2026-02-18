import { BioMachine } from '../lib/generator/BioMachine';
import { BioData } from '../lib/generator/types';

describe('BioMachine Pinning', () => {
    const mockData: BioData = {
        childhood: [
            { id: 'origin_urban', slot: 'CHILDHOOD', text: 'Urban', provides: ['TAG_URBAN'], weights: { DEFAULT: 1 }, phase: 'Childhood' },
            { id: 'origin_rural', slot: 'CHILDHOOD', text: 'Rural', provides: ['TAG_RURAL'], weights: { DEFAULT: 1 }, phase: 'Childhood' }
        ],
        formative: [
            { id: 'edu_basic', slot: 'FORMATIVE', text: 'Basic Edu', weights: { DEFAULT: 1 }, phase: 'Formative' }
        ],
        professional: [
            { id: 'job_city', slot: 'PROFESSIONAL', text: 'City Job', requires: ['TAG_URBAN'], weights: { DEFAULT: 1 }, phase: 'Professional' },
            { id: 'job_farm', slot: 'PROFESSIONAL', text: 'Farm Job', requires: ['TAG_RURAL'], weights: { DEFAULT: 1 }, phase: 'Professional' }
        ],
        senior: [],
        lifeEvents: [],
        tags: [],
        groups: []
    };

    it('should respect generic pinning', () => {
        const machine = new BioMachine(mockData);

        // Pin "Rural" origin
        const result = machine.generate({
            age: 30,
            pinnedNodeIds: ['origin_rural']
        });

        const spineIds = result.spine.map(n => n.id);
        expect(spineIds).toContain('origin_rural');
        expect(spineIds).not.toContain('origin_urban');
    });

    it('should implement backward propagation for pinned nodes', () => {
        const machine = new BioMachine(mockData);

        // Pin "City Job". This requires TAG_URBAN.
        // Therefore, "Urban" origin MUST be selected, even though "Rural" is available.
        const result = machine.generate({
            age: 30,
            pinnedNodeIds: ['job_city']
        });

        const spineIds = result.spine.map(n => n.id);

        expect(spineIds).toContain('job_city');
        // Check if backward propagation forced the correct origin
        expect(spineIds).toContain('origin_urban');
        expect(spineIds).not.toContain('origin_rural');
    });

    it('should respect multiple pinned nodes', () => {
        const machine = new BioMachine(mockData);

        // Pin both Rural and Farm Job (consistent)
        const result = machine.generate({
            age: 30,
            pinnedNodeIds: ['origin_rural', 'job_farm']
        });

        const spineIds = result.spine.map(n => n.id);
        expect(spineIds).toContain('origin_rural');
        expect(spineIds).toContain('job_farm');
    });
});
