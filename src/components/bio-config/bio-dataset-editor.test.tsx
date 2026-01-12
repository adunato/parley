/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BioDatasetEditor } from './bio-dataset-editor';
import { EventNode } from '@/lib/generator/types';

const mockData: EventNode[] = [
    {
        id: 'test-event-1',
        slot: 'ORIGIN',
        text: 'Test Origin',
        weights: {
            'WARRIOR': 0.8,
            'DEFAULT': 1
        }
    }
];

describe('BioDatasetEditor', () => {
    it('renders the "Influenced by" column and displays weights', () => {
        render(
            <BioDatasetEditor 
                data={mockData} 
                type="ORIGIN" 
                onAdd={jest.fn()} 
                onUpdate={jest.fn()} 
                onDelete={jest.fn()} 
                title="Test Editor" 
                description="Test Description" 
            />
        );

        expect(screen.getByText('Influenced by')).toBeInTheDocument();
        // Check for the tag and weight. Note: The implementation might format it differently, 
        // but the plan specifies TAG:weight format.
        expect(screen.getByText(/WARRIOR:0.8/)).toBeInTheDocument();
    });
});
