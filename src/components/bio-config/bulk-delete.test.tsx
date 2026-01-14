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
        addGroup: jest.fn()
    }));
    return {
        useBioStore: mock
    };
});

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

const mockData: EventNode[] = [
    { id: '1', slot: 'CHILDHOOD', text: 'Node 1', weights: { DEFAULT: 1 }, phase: 'Childhood' },
    { id: '2', slot: 'CHILDHOOD', text: 'Node 2', weights: { DEFAULT: 1 }, phase: 'Childhood' }
];

describe('Bulk Delete', () => {
    beforeEach(() => {
        mockConfirm.mockReset();
        mockConfirm.mockReturnValue(true);
    });

    it('triggers bulk delete with confirmation', () => {
        const onDelete = jest.fn();
        render(
            <BioDatasetEditor 
                data={mockData} 
                type="CHILDHOOD" 
                title="Test" 
                description="Desc"
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={onDelete}
            />
        );

        // Select items
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[2]);

        // Click Bulk Delete (in Toolbar)
        // Note: Toolbar delete button appears when items are selected
        const deleteBtn = screen.getByText('Delete').closest('button') as HTMLElement;
        fireEvent.click(deleteBtn);

        expect(mockConfirm).toHaveBeenCalled();
        
        // Should call onDelete twice
        expect(onDelete).toHaveBeenCalledTimes(2);
        expect(onDelete).toHaveBeenCalledWith('1');
        expect(onDelete).toHaveBeenCalledWith('2');
    });

    it('single delete does NOT trigger confirmation', () => {
        const onDelete = jest.fn();
        mockConfirm.mockClear();

        render(
            <BioDatasetEditor 
                data={mockData} 
                type="CHILDHOOD" 
                title="Test" 
                description="Desc"
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={onDelete}
            />
        );

        // Click Row Delete
        const rowDeleteBtns = screen.getAllByTitle('Delete');
        // The first one might be in toolbar if selected, but we haven't selected anything.
        // Wait, if 0 selected, toolbar delete is hidden.
        // rowDeleteBtns should be from the table rows.
        fireEvent.click(rowDeleteBtns[0]);

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledWith('1');
    });
});
