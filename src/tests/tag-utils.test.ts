import { BioData, EventNode, LifeEvent } from '../lib/generator/types';
import { getTagRelationships } from '../lib/generator/tag-utils';

const mockData: BioData = {
    childhood: [
        {
            id: 'origin_1',
            slot: 'CHILDHOOD',
            text: 'Origin 1',
            provides: ['TAG_A'],
            weights: { DEFAULT: 1 }
        }
    ],
    formative: [
        {
            id: 'edu_1',
            slot: 'FORMATIVE',
            text: 'Edu 1',
            requires: ['TAG_A'],
            provides: ['TAG_B'],
            weights: { TAG_A: 2, DEFAULT: 1 }
        }
    ],
    professional: [
        {
            id: 'career_1',
            slot: 'PROFESSIONAL',
            text: 'Career 1',
            requires: ['TAG_B'],
            weights: { TAG_A: 5, DEFAULT: 1 }
        }
    ],
    senior: [],
    lifeEvents: [
        {
            id: 'event_1',
            text: 'Event 1',
            provides: ['TAG_A'],
            weights: { TAG_B: 0.5, DEFAULT: 1 }
        }
    ],
    tags: [{ id: 'TAG_A' },         { id: 't2', description: 'Tag 2' }
    ],
    groups: []
};

describe('tag-utils', () => {
    describe('getTagRelationships', () => {
        it('should correctly identify "Provided by" entities', () => {
            const rels = getTagRelationships('TAG_A', mockData);
            expect(rels.providedBy).toContain('origin_1');
            expect(rels.providedBy).toContain('event_1');
            expect(rels.providedBy).not.toContain('edu_1');
        });

        it('should correctly identify "Required by" entities', () => {
            const rels = getTagRelationships('TAG_A', mockData);
            expect(rels.requiredBy).toContain('edu_1');
            expect(rels.requiredBy).not.toContain('career_1');
        });

        it('should correctly identify "Influences" entities with weights', () => {
            const relsA = getTagRelationships('TAG_A', mockData);
            expect(relsA.influences).toContain('edu_1:2');
            expect(relsA.influences).toContain('career_1:5');

            const relsB = getTagRelationships('TAG_B', mockData);
            expect(relsB.influences).toContain('event_1:0.5');
        });
    });
});