import { render, screen, fireEvent } from '@testing-library/react';
import { BioDatasetEditor } from './bio-dataset-editor';
import { EventNode } from '@/lib/generator/types';

// Mock dependencies
jest.mock("@/lib/store/bioStore", () => ({
    useBioStore: {
        getState: () => ({
            registerTags: jest.fn()
        })
    }
}));

const mockData: EventNode[] = [
    { id: '1', slot: 'CHILDHOOD', text: 'Node 1', weights: { DEFAULT: 1 }, phase: 'Childhood' },
    { id: '2', slot: 'CHILDHOOD', text: 'Node 2', weights: { DEFAULT: 1 }, phase: 'Childhood' }
];

describe('BioDatasetEditor Selection', () => {
    it('renders checkboxes for selection', () => {
        render(
            <BioDatasetEditor 
                data={mockData} 
                type="CHILDHOOD" 
                title="Test" 
                description="Desc"
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
            />
        );
        
        // Should find checkboxes. We expect 1 header checkbox + 2 row checkboxes = 3
        // If not implemented, this throws
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThanOrEqual(2); 
    });

    it('allows multi-selection', () => {
        render(
             <BioDatasetEditor 
                data={mockData} 
                type="CHILDHOOD" 
                title="Test" 
                description="Desc"
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
