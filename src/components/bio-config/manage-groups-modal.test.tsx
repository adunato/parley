import { render, screen, fireEvent } from '@testing-library/react';
import { ManageGroupsModal } from './manage-groups-modal';
import { useBioStore } from '@/lib/store/bioStore';

// Mock store
jest.mock("@/lib/store/bioStore", () => ({
    useBioStore: jest.fn()
}));

const mockGroups = [
    { id: 'g1', name: 'Group 1', description: 'Desc 1' },
    { id: 'g2', name: 'Group 2' }
];

describe('ManageGroupsModal', () => {
    beforeEach(() => {
        (useBioStore as any).mockReturnValue({
            groups: mockGroups,
            updateGroup: jest.fn(),
            deleteGroup: jest.fn()
        });
        window.confirm = jest.fn().mockReturnValue(true);
    });

    it('renders list of groups', () => {
        render(<ManageGroupsModal open={true} onOpenChange={() => {}} />);
        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 2')).toBeInTheDocument();
    });

    it('calls updateGroup when renaming', () => {
        const updateGroup = jest.fn();
        (useBioStore as any).mockReturnValue({
            groups: mockGroups,
            updateGroup,
            deleteGroup: jest.fn()
        });

        render(<ManageGroupsModal open={true} onOpenChange={() => {}} />);
        
        // click edit on first group
        const editButtons = screen.getAllByTitle(/Edit/i);
        fireEvent.click(editButtons[0]);
        
        // change name
        const input = screen.getByDisplayValue('Group 1');
        fireEvent.change(input, { target: { value: 'Renamed Group' } });
        
        // click save
        fireEvent.click(screen.getByTitle(/Save/i));
        
        expect(updateGroup).toHaveBeenCalledWith({ id: 'g1', name: 'Renamed Group', description: 'Desc 1' });
    });

    it('calls deleteGroup when deleting', () => {
        const deleteGroup = jest.fn();
        (useBioStore as any).mockReturnValue({
            groups: mockGroups,
            updateGroup: jest.fn(),
            deleteGroup
        });

        render(<ManageGroupsModal open={true} onOpenChange={() => {}} />);
        
        const deleteButtons = screen.getAllByTitle(/Delete/i);
        fireEvent.click(deleteButtons[0]);
        
        expect(deleteGroup).toHaveBeenCalledWith('g1');
    });
});
