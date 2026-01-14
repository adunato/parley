import { render, screen, fireEvent } from '@testing-library/react';
import { CreateGroupModal } from './create-group-modal';

describe('CreateGroupModal', () => {
    it('renders when open', () => {
        render(<CreateGroupModal open={true} onOpenChange={() => {}} onSave={() => {}} />);
        expect(screen.getByText(/Create New Group/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Group Name/i)).toBeInTheDocument();
    });

    it('validates name requirement', () => {
        const onSave = jest.fn();
        render(<CreateGroupModal open={true} onOpenChange={() => {}} onSave={onSave} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Create/i }));
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with input data', () => {
        const onSave = jest.fn();
        render(<CreateGroupModal open={true} onOpenChange={() => {}} onSave={onSave} />);
        
        fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'New Group' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A test description' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Create/i }));
        expect(onSave).toHaveBeenCalledWith({ name: 'New Group', description: 'A test description' });
    });
});
