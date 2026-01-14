import { useBioStore } from '../lib/store/bioStore';
import { BioGroup } from '../lib/generator/types';
import { act, renderHook } from '@testing-library/react';

// Mock DexieStorageAdapter
jest.mock('../lib/storage-adapter', () => ({
    DexieStorageAdapter: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

describe('BioStore Groups', () => {
    // Reset store before each test
    beforeEach(() => {
        const { result } = renderHook(() => useBioStore());
        act(() => {
             // Reset state directly
             useBioStore.setState({
                childhood: [],
                formative: [],
                professional: [],
                senior: [],
                lifeEvents: [],
                tags: [],
                groups: [],
                phaseConfig: undefined,
                _hasHydrated: true
            });
        });
    });

    it('should add a group', () => {
        const { result } = renderHook(() => useBioStore());
        const newGroup: BioGroup = { id: 'g1', name: 'Group 1' };
        
        act(() => {
            result.current.addGroup(newGroup);
        });

        expect(result.current.groups).toHaveLength(1);
        expect(result.current.groups[0]).toEqual(newGroup);
    });

    it('should update a group', () => {
        const { result } = renderHook(() => useBioStore());
        const newGroup: BioGroup = { id: 'g1', name: 'Group 1' };
        
        act(() => {
            result.current.addGroup(newGroup);
            result.current.updateGroup({ id: 'g1', name: 'Updated Group' });
        });

        expect(result.current.groups[0].name).toBe('Updated Group');
    });

    it('should delete a group and unassign entities', () => {
        const { result } = renderHook(() => useBioStore());
        const group: BioGroup = { id: 'g1', name: 'Group 1' };
        
        act(() => {
            result.current.addGroup(group);
            // Add entity associated with group
            result.current.addChildhood({
                id: 'c1',
                slot: 'CHILDHOOD',
                text: 'Test',
                weights: { DEFAULT: 1 },
                phase: 'Childhood',
                groupId: 'g1'
            });
        });

        // Verify assignment
        expect(result.current.childhood[0].groupId).toBe('g1');

        act(() => {
            result.current.deleteGroup('g1');
        });

        expect(result.current.groups).toHaveLength(0);
        // Verify unassignment
        expect(result.current.childhood[0].groupId).toBeUndefined();
    });
});
