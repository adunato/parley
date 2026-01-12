/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TagDatasetEditor } from './tag-dataset-editor';
import { BioData } from '@/lib/generator/types';

const mockBioData: BioData = {
    origins: [],
    education: [],
    careers: [],
    lifeEvents: [],
    tags: [{ id: 'TEST_TAG' }]
};

describe('TagDatasetEditor', () => {
    it('renders the tags table with correct columns', () => {
        render(
            <TagDatasetEditor 
                tags={mockBioData.tags} 
                bioData={mockBioData}
                onAdd={jest.fn()} 
                onUpdate={jest.fn()} 
                onDelete={jest.fn()} 
            />
        );

        expect(screen.getByText('Tags')).toBeInTheDocument();
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Provided by')).toBeInTheDocument();
        expect(screen.getByText('Required by')).toBeInTheDocument();
        expect(screen.getByText('Influences')).toBeInTheDocument();
        expect(screen.getByText('TEST_TAG')).toBeInTheDocument();
    });
});
