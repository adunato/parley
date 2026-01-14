import { render, screen, fireEvent } from '@testing-library/react';
import { TagDatasetEditor } from './tag-dataset-editor';
import { Tag, BioData } from '@/lib/generator/types';

// Mock dependencies
jest.mock("@/lib/store/bioStore", () => ({
    useBioStore: {
        getState: () => ({
            registerTags: jest.fn(),
            deleteTag: jest.fn(),
            updateTag: jest.fn(),
            addTag: jest.fn(),
            _hasHydrated: true
        })
    }
}));

const mockTags: Tag[] = [
    { id: 'T1', description: 'Tag 1' },
    { id: 'T2', description: 'Tag 2' }
];

const mockBioData: BioData = {
    childhood: [],
    formative: [],
    professional: [],
    senior: [],
    lifeEvents: [],
    tags: mockTags,
    groups: [],
    phaseConfig: undefined
};

describe('TagDatasetEditor Selection', () => {
    it('renders checkboxes for selection', () => {
        render(
            <TagDatasetEditor 
                tags={mockTags} 
                bioData={mockBioData}
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
            />
        );
        
        // Should find checkboxes. We expect 1 header checkbox + 2 row checkboxes = 3
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThanOrEqual(2); 
    });

    it('allows multi-selection', () => {
        render(
            <TagDatasetEditor 
                tags={mockTags} 
                bioData={mockBioData}
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
            />
        );
        
        const checkboxes = screen.getAllByRole('checkbox');
        // Index 0 is likely "Select All" in header
        fireEvent.click(checkboxes[1]); // Select Row 1
        fireEvent.click(checkboxes[2]); // Select Row 2
        
        // Check if both are checked
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).toBeChecked();
    });
});
