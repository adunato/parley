import { render, screen, fireEvent } from '@testing-library/react';
import { BioDatasetEditor } from './bio-dataset-editor';
import { useBioStore } from '@/lib/store/bioStore';

// Mock dependencies
jest.mock("@/lib/store/bioStore", () => {
    const mock = jest.fn(() => ({
        groups: [],
        phaseConfig: {}
    }));
    (mock as any).getState = jest.fn(() => ({
        addGroup: jest.fn()
    }));
    return {
        useBioStore: mock
    };
});

const mockData: any[] = [
    { id: '1', slot: 'CHILDHOOD', text: 'Node 1', weights: { DEFAULT: 1 }, phase: 'Childhood' }
];

describe('Grouping Workflow', () => {
    it('completes the full grouping flow', async () => {
        const onUpdate = jest.fn();
        const addGroup = jest.fn();
        (useBioStore.getState as any).mockReturnValue({ addGroup });

        render(
            <BioDatasetEditor 
                data={mockData} 
                type="CHILDHOOD" 
                title="Test"
                description="Desc"
                onAdd={() => {}}
                onUpdate={onUpdate}
                onDelete={() => {}}
            />
        );

        // 1. Select item
        const checkbox = screen.getAllByRole('checkbox')[1];
        fireEvent.click(checkbox);

        // 2. Click Group
        fireEvent.click(screen.getByRole('button', { name: /^Group$/i }));

        // 3. Fill Modal
        expect(screen.getByText(/Create New Group/i)).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'New Group' } });
        
        // 4. Submit
        fireEvent.click(screen.getByRole('button', { name: /Create/i }));

        // 5. Verify store and updates
        expect(addGroup).toHaveBeenCalled();
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            groupId: expect.any(String)
        }));
    });
});
