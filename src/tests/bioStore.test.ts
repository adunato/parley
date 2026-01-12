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
            origins: [],
            education: [],
            careers: [],
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
            origins: [{ id: 'o1', slot: 'ORIGIN', text: 't', provides: [oldId], weights: { DEFAULT: 1 } }],
            education: [{ id: 'e1', slot: 'EDUCATION', text: 't', requires: [oldId], provides: ['OTHER'], weights: { [oldId]: 5, DEFAULT: 1 } }],
            careers: [{ id: 'c1', slot: 'CAREER', text: 't', requires: ['OTHER'], weights: { [oldId]: 10, DEFAULT: 1 } }],
            lifeEvents: [{ id: 'ev1', text: 't', provides: [oldId], weights: { [oldId]: 0.5, DEFAULT: 1 } }],
            tags: [{ id: oldId }],
            _hasHydrated: true
        });

        useBioStore.getState().updateTag({ id: newId }, oldId);

        const state = useBioStore.getState();
        expect(state.tags[0].id).toBe(newId);
        expect(state.origins[0].provides).toContain(newId);
        expect(state.education[0].requires).toContain(newId);
        expect(state.education[0].weights[newId]).toBe(5);
        expect(state.careers[0].weights[newId]).toBe(10);
        expect(state.lifeEvents[0].provides).toContain(newId);
        expect(state.lifeEvents[0].weights[newId]).toBe(0.5);
    });
});
