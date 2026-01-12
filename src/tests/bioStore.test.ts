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
});
