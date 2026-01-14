import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionToolbar } from './selection-toolbar';

describe('SelectionToolbar', () => {
    it('renders container but no text/delete when selectedCount is 0', () => {
        const { container } = render(<SelectionToolbar selectedCount={0} onDelete={() => {}} />);
        expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders when items selected', () => {
        render(<SelectionToolbar selectedCount={2} onDelete={() => {}} />);
        expect(screen.getByText('2 selected')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('calls onDelete', () => {
        const onDelete = jest.fn();
        render(<SelectionToolbar selectedCount={1} onDelete={onDelete} />);
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
        expect(onDelete).toHaveBeenCalled();
    });

    it('renders children actions', () => {
         render(
            <SelectionToolbar selectedCount={1} onDelete={() => {}}>
                <button>Custom Action</button>
            </SelectionToolbar>
         );
         expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });
});
