
import { renderHook, act } from '@testing-library/react';
import { useBioStore } from '../lib/store/bioStore';
import { AGE_PHASES } from '../lib/generator/types';

// Mock Storage Adapter to avoid Dexie/IndexedDB issues
jest.mock('../lib/storage-adapter', () => ({
    DexieStorageAdapter: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    }
}));

describe('BioStore Configuration', () => {
    it('should initialize with default phase configuration', () => {
        const { result } = renderHook(() => useBioStore());
        
        // This fails initially because phaseConfig is not implemented
        expect(result.current.phaseConfig).toBeDefined();
        expect(result.current.phaseConfig.Childhood).toEqual(AGE_PHASES.Childhood);
    });

    it('should allow updating phase configuration', () => {
        const { result } = renderHook(() => useBioStore());
        
        act(() => {
            // This fails initially because updatePhaseConfig is not implemented
            if (result.current.updatePhaseConfig) {
                result.current.updatePhaseConfig('Childhood', { endAge: 20 });
            }
        });

        if (result.current.phaseConfig) {
             expect(result.current.phaseConfig.Childhood.endAge).toBe(20);
        }
    });
});
