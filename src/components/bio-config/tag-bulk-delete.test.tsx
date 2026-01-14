import { render, screen, fireEvent } from '@testing-library/react';
import { TagDatasetEditor } from './tag-dataset-editor';
import { Tag, BioData } from '@/lib/generator/types';

// Mock dependencies
jest.mock("@/lib/store/bioStore", () => ({
    useBioStore: {
        getState: () => ({
            registerTags: jest.fn()
        })
    }
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

const mockTags: Tag[] = [
    { id: 'T1' },
    { id: 'T2' }
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

describe('Tag Bulk Delete', () => {
    beforeEach(() => {
        mockConfirm.mockReset();
        mockConfirm.mockReturnValue(true);
    });

    it('triggers bulk delete with confirmation', () => {
        const onDelete = jest.fn();
        render(
            <TagDatasetEditor 
                tags={mockTags} 
                bioData={mockBioData}
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={onDelete}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[2]);

        const deleteBtn = screen.getByText('Delete').closest('button') as HTMLElement;
        fireEvent.click(deleteBtn);

        expect(mockConfirm).toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledTimes(2);
    });

    it('single delete does NOT trigger confirmation (no refs)', () => {
        const onDelete = jest.fn();
        mockConfirm.mockClear();
        
        render(
            <TagDatasetEditor 
                tags={mockTags} 
                bioData={mockBioData}
                onAdd={() => {}}
                onUpdate={() => {}}
                onDelete={onDelete}
            />
        );

        const rowDeleteBtns = screen.getAllByTitle('Delete');
        fireEvent.click(rowDeleteBtns[0]);

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledWith('T1');
    });
});
