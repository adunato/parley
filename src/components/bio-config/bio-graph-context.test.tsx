import { render, screen, fireEvent } from '@testing-library/react';
import { BioGraphProvider, useBioGraphContext } from './bio-graph-context';
import { AgePhase } from '@/lib/generator/types';

const TestComponent = () => {
    const {
        hiddenPhases, togglePhaseVisibility,
        hiddenTypes, toggleTypeVisibility,
        highlightedGroupId, setHighlightedGroupId
    } = useBioGraphContext();

    return (
        <div>
            <div data-testid="hidden-phases">{hiddenPhases ? Array.from(hiddenPhases).join(',') : ''}</div>
            <div data-testid="hidden-types">{hiddenTypes ? Array.from(hiddenTypes).join(',') : ''}</div>
            <div data-testid="highlighted-group">{highlightedGroupId || ''}</div>
            <button onClick={() => togglePhaseVisibility('Childhood')}>Toggle Childhood</button>
            <button onClick={() => toggleTypeVisibility('LIFE_EVENT')}>Toggle LifeEvent</button>
            <button onClick={() => setHighlightedGroupId('g1')}>Set Group</button>
        </div>
    );
};

describe('BioGraphContext', () => {
    it('manages filter state correctly', () => {
        render(
            <BioGraphProvider>
                <TestComponent />
            </BioGraphProvider>
        );

        // Initial state
        expect(screen.getByTestId('hidden-phases')).toBe('');

        // Toggle Phase - Should add it
        fireEvent.click(screen.getByText('Toggle Childhood'));
        expect(screen.getByTestId('hidden-phases')).toBe('Childhood');

        // Toggle Phase - Should remove it
        fireEvent.click(screen.getByText('Toggle Childhood'));
        expect(screen.getByTestId('hidden-phases')).toBe('');

        // Toggle Type
        fireEvent.click(screen.getByText('Toggle LifeEvent'));
        expect(screen.getByTestId('hidden-types')).toBe('LIFE_EVENT');

        // Group
        fireEvent.click(screen.getByText('Set Group'));
        expect(screen.getByTestId('highlighted-group')).toBe('g1');
    });
});
