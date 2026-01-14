import { useBioStore } from '../lib/store/bioStore';
import { Tag } from '../lib/generator/types';

// Mock DexieStorageAdapter
jest.mock('../lib/storage-adapter', () => ({
    DexieStorageAdapter: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

describe('useBioStore', () => {
    beforeEach(() => {
        useBioStore.setState({
            childhood: [],
            formative: [],
            professional: [],
            senior: [],
            lifeEvents: [],
            tags: [],
            _hasHydrated: true,
        });
    });

    it('should add a tag', () => {
        const newTag: Tag = { id: 'TEST_TAG', description: 'Test Description' };
        useBioStore.getState().addTag(newTag);
        
        const state = useBioStore.getState();
        expect(state.tags).toHaveLength(1);
        expect(state.tags[0]).toEqual(newTag);
    });

    it('should update a tag', () => {
        const tag: Tag = { id: 'TEST_TAG', description: 'Initial Description' };
        useBioStore.getState().addTag(tag);
        
        const updatedTag: Tag = { id: 'TEST_TAG', description: 'Updated Description' };
        useBioStore.getState().updateTag(updatedTag);
        
        const state = useBioStore.getState();
        expect(state.tags[0].description).toBe('Updated Description');
    });

    it('should delete a tag', () => {
        const tag: Tag = { id: 'TEST_TAG', description: 'Test Description' };
        useBioStore.getState().addTag(tag);
        
        useBioStore.getState().deleteTag('TEST_TAG');
        
        const state = useBioStore.getState();
        expect(state.tags).toHaveLength(0);
    });

    it('should cascade rename tag ID across all entities', () => {
        const oldId = 'OLD_TAG';
        const newId = 'NEW_TAG';

        useBioStore.setState({
            childhood: [{ id: 'o1', slot: 'CHILDHOOD', text: 't', provides: [oldId], weights: { DEFAULT: 1 } }],
            formative: [{ id: 'e1', slot: 'FORMATIVE', text: 't', requires: [oldId], provides: ['OTHER'], weights: { [oldId]: 5, DEFAULT: 1 } }],
            professional: [{ id: 'c1', slot: 'PROFESSIONAL', text: 't', requires: ['OTHER'], weights: { [oldId]: 10, DEFAULT: 1 } }],
            senior: [],
            lifeEvents: [{ id: 'ev1', text: 't', provides: [oldId], weights: { [oldId]: 0.5, DEFAULT: 1 } }],
            tags: [{ id: oldId }],
            _hasHydrated: true
        });

        useBioStore.getState().updateTag({ id: newId }, oldId);

        const state = useBioStore.getState();
        expect(state.tags[0].id).toBe(newId);
        expect(state.childhood[0].provides).toContain(newId);
        expect(state.formative[0].requires).toContain(newId);
        expect(state.formative[0].weights[newId]).toBe(5);
        expect(state.professional[0].weights[newId]).toBe(10);
        expect(state.lifeEvents[0].provides).toContain(newId);
        expect(state.lifeEvents[0].weights[newId]).toBe(0.5);
    });

    it('should cascade rename tag ID in lifeEvents requires field', () => {
        const oldId = 'OLD_TAG';
        const newId = 'NEW_TAG';

        useBioStore.setState({
            lifeEvents: [
                { id: 'ev1', text: 't', requires: [oldId], weights: { DEFAULT: 1 } }
            ],
            tags: [{ id: oldId }],
            _hasHydrated: true
        });

        useBioStore.getState().updateTag({ id: newId }, oldId);

        const state = useBioStore.getState();
        expect(state.lifeEvents[0].requires).toContain(newId);
        expect(state.lifeEvents[0].requires).not.toContain(oldId);
    });

    it('should cascade delete tag ID across all entities', () => {
        const tagId = 'TO_DELETE';

        useBioStore.setState({
            childhood: [{ id: 'o1', slot: 'CHILDHOOD', text: 't', provides: [tagId, 'KEEP'], weights: { DEFAULT: 1 } }],
            lifeEvents: [{ id: 'ev1', text: 't', requires: [tagId], provides: [tagId], weights: { [tagId]: 1, DEFAULT: 1 } }],
            tags: [{ id: tagId }, { id: 'KEEP' }],
            _hasHydrated: true
        });

        useBioStore.getState().deleteTag(tagId);

        const state = useBioStore.getState();
        expect(state.tags).toHaveLength(1);
        expect(state.childhood[0].provides).not.toContain(tagId);
        expect(state.childhood[0].provides).toContain('KEEP');
        expect(state.lifeEvents[0].requires).not.toContain(tagId);
        expect(state.lifeEvents[0].provides).not.toContain(tagId);
        expect(state.lifeEvents[0].weights[tagId]).toBeUndefined();
    });
});