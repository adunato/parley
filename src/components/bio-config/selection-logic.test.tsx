import { render, screen, fireEvent } from '@testing-library/react';
import { BioDatasetEditor } from './bio-dataset-editor';
import { EventNode } from '@/lib/generator/types';

// Mock dependencies
jest.mock("@/lib/store/bioStore", () => {
    const mock = jest.fn(() => ({
        groups: [],
        phaseConfig: {}
    }));
    (mock as any).getState = jest.fn(() => ({
        registerTags: jest.fn(),
        addGroup: jest.fn(),
        groups: []
    }));
    return {
        useBioStore: mock
    };
});

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
        fireEvent.click(checkboxes[1]); // Select Row 1
        fireEvent.click(checkboxes[2]); // Select Row 2
        
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).toBeChecked();
    });

    it('shows Group action for spine entities but not for life events', () => {
        const { rerender } = render(
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
        fireEvent.click(checkboxes[1]); 
        
        expect(screen.getByRole('button', { name: /^Group$/i })).toBeInTheDocument();

        rerender(
            <BioDatasetEditor 
                data={mockData} 
                type="LIFE_EVENT" 
                title="Test" 
                description="Desc"
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
            />
        );
        expect(screen.queryByRole('button', { name: /^Group$/i })).not.toBeInTheDocument();
    });

    it('shows Group column and displays group name for spine entities', () => {
        const mockGroups = [{ id: 'g1', name: 'Group Alpha' }];
        const { useBioStore } = require("@/lib/store/bioStore");
        
        useBioStore.mockReturnValue({
            groups: mockGroups,
            phaseConfig: {}
        });

        const dataWithGroup: EventNode[] = [
            { id: '1', slot: 'CHILDHOOD', text: 'Node 1', weights: { DEFAULT: 1 }, phase: 'Childhood', groupId: 'g1' }
        ];

        render(
            <BioDatasetEditor 
                data={dataWithGroup} 
                type="CHILDHOOD" 
                title="Test" 
                description="Desc"
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
            />
        );
        
        expect(screen.getByText('Group')).toBeInTheDocument();
        expect(screen.getByText('Group Alpha')).toBeInTheDocument();
    });
});