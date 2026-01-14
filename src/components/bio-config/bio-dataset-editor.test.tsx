/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BioDatasetEditor } from "./bio-dataset-editor";
import { EventNode } from "@/lib/generator/types";

// Mock ResizeObserver for cmkd
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockRegisterTags = jest.fn();

jest.mock("@/lib/store/bioStore", () => {
  const mockStore = () => ({
    tags: []
  });
  mockStore.getState = () => ({
    registerTags: mockRegisterTags
  });
  return { useBioStore: mockStore };
});

const mockData: EventNode[] = [
    {
        id: "test-event-1",
        slot: "ORIGIN",
        text: "Test Origin",
        weights: {
            "WARRIOR": 0.8,
            "DEFAULT": 1
        }
    }
];

describe("BioDatasetEditor", () => {
    beforeEach(() => {
        mockRegisterTags.mockClear();
    });

    it("renders the \"Influenced by\" column and displays weights", () => {
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

        expect(screen.getByText("Influenced by")).toBeInTheDocument();
        expect(screen.getByText(/WARRIOR:0.8/)).toBeInTheDocument();
    });

    it("registers new tags when creating an entity", async () => {
        render(
            <BioDatasetEditor 
                data={[]}
                type="ORIGIN" 
                onAdd={jest.fn()} 
                onUpdate={jest.fn()} 
                onDelete={jest.fn()} 
                title="Test Editor" 
                description="Test Description" 
            />
        );

        // Open New Entry modal
        fireEvent.click(screen.getByText("New Entry"));

        // Fill ID and Text to enable Save
        fireEvent.change(screen.getByPlaceholderText("my_entity_id"), { target: { value: "new-origin" } });
        fireEvent.change(screen.getByPlaceholderText("Description of the event..."), { target: { value: "New Description" } });

        // Add a new tag to "Provides Tags"
        const tagInput = screen.getByPlaceholderText("WEALTHY"); // Placeholder from BioEntityEditor
        fireEvent.change(tagInput, { target: { value: "NEW_GLOBAL_TAG" } });
        
        // Find the "Plus" button next to the input and click it
        // The plus button is in TagListEditor -> TagSelector sibling
        // We can find by the plus icon class or role.
        // In TagListEditor, it's a Button with a Plus icon.
        // Let's use a more robust selector if possible, or just getAllByRole("button") and find the one.
        const buttons = screen.getAllByRole("button");
        // The "Provides" section is the first TagListEditor. 
        // The button we want is the one that adds the tag.
        // Assuming the first "plus" button inside the dialog is for the first tag list.
        const addTagBtn = buttons.find(b => b.querySelector(".lucide-plus"));
        if (addTagBtn) fireEvent.click(addTagBtn);

        // Click Save
        fireEvent.click(screen.getByText("Save"));

        // Expect registerTags to have been called
        await waitFor(() => {
            expect(mockRegisterTags).toHaveBeenCalledWith(expect.arrayContaining(["NEW_GLOBAL_TAG"]));
                });
            });
        
            it("filters data by phase if provided", () => {
                const mixedData: EventNode[] = [
                    { id: "e1", slot: "ORIGIN", text: "Childhood Origin", phase: "Childhood", weights: { DEFAULT: 1 } },
                    { id: "e2", slot: "ORIGIN", text: "Other Origin", phase: "Formative", weights: { DEFAULT: 1 } } // Should not happen for Origin but good for test
                ];
        
                render(
                    <BioDatasetEditor 
                        data={mixedData} 
                        type="ORIGIN" 
                        phase="Childhood"
                        onAdd={jest.fn()} 
                        onUpdate={jest.fn()} 
                        onDelete={jest.fn()} 
                        title="Test" 
                        description="Test" 
                    />
                );
        
                expect(screen.getByText("Childhood Origin")).toBeInTheDocument();
                expect(screen.queryByText("Other Origin")).not.toBeInTheDocument();
            });
        
            it("hides Age Phases column for non-LIFE_EVENT types", () => {
                render(
                    <BioDatasetEditor 
                        data={mockData} 
                        type="ORIGIN" 
                        onAdd={jest.fn()} 
                        onUpdate={jest.fn()} 
                        onDelete={jest.fn()} 
                        title="Test" 
                        description="Test" 
                    />
                );
        
                expect(screen.queryByText("Age Phases")).not.toBeInTheDocument();
            });
        
            it("shows Age Phases column for LIFE_EVENT type", () => {
                render(
                    <BioDatasetEditor 
                        data={[]} 
                        type="LIFE_EVENT" 
                        onAdd={jest.fn()} 
                        onUpdate={jest.fn()} 
                        onDelete={jest.fn()} 
                        title="Test" 
                        description="Test" 
                    />
                );
        
                expect(screen.getByText("Age Phases")).toBeInTheDocument();
            });
        });
        