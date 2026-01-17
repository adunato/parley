/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenerateEventsDialog } from "./generate-events-dialog";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockActions = {
    addLifeEvent: jest.fn(),
    addChildhood: jest.fn(),
    addFormative: jest.fn(),
    addProfessional: jest.fn(),
    addSenior: jest.fn(),
    addTag: jest.fn(),
};

jest.mock("@/lib/store/bioStore", () => ({
  useBioStore: (selector: any) => {
    const state = {
      ...mockActions,
      lifeEvents: [],
      tags: []
    };
    return selector(state);
  }
}));

// Mock fetch for generation
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      events: [
        {
          id: "generated-spine-1",
          text: "Generated Spine Node",
          weights: { DEFAULT: 1 },
          provides: ["TAG_1"]
        }
      ],
      newTags: []
    }),
  })
) as jest.Mock;

describe("GenerateEventsDialog - Spine Node Support", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("uses addChildhood when 'Add' is clicked for a CHILDHOOD context", async () => {
        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                type="CHILDHOOD"
                phase="Childhood"
            />
        );

        fireEvent.click(screen.getByText("Generate Milestones"));
        await waitFor(() => screen.getByText("Generated Spine Node"));
        fireEvent.click(screen.getByText("Add"));
        expect(mockActions.addChildhood).toHaveBeenCalled();
    });

    it("uses addFormative when 'Add' is clicked for a FORMATIVE context", async () => {
        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                type="FORMATIVE"
                phase="Formative"
            />
        );

        fireEvent.click(screen.getByText("Generate Milestones"));
        await waitFor(() => screen.getByText("Generated Spine Node"));
        fireEvent.click(screen.getByText("Add"));
        expect(mockActions.addFormative).toHaveBeenCalled();
    });

    it("uses addProfessional when 'Add' is clicked for a PROFESSIONAL context", async () => {
        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                type="PROFESSIONAL"
                phase="Professional"
            />
        );

        fireEvent.click(screen.getByText("Generate Milestones"));
        await waitFor(() => screen.getByText("Generated Spine Node"));
        fireEvent.click(screen.getByText("Add"));
        expect(mockActions.addProfessional).toHaveBeenCalled();
    });

    it("uses addSenior when 'Add' is clicked for a SENIOR context", async () => {
        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                type="SENIOR"
                phase="Senior"
            />
        );

        fireEvent.click(screen.getByText("Generate Milestones"));
        await waitFor(() => screen.getByText("Generated Spine Node"));
        fireEvent.click(screen.getByText("Add"));
        expect(mockActions.addSenior).toHaveBeenCalled();
    });

    it("registers new tags when 'Add' is clicked", async () => {
        // Update fetch mock for this test
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    events: [
                        {
                            id: "new-event",
                            text: "New Event with Tags",
                            weights: { "NEW_TAG": 2, "DEFAULT": 1 },
                            provides: ["ANOTHER_NEW_TAG"]
                        }
                    ],
                    newTags: [
                        { id: "NEW_TAG", description: "Desc 1" },
                        { id: "ANOTHER_NEW_TAG", description: "Desc 2" }
                    ]
                }),
            })
        );

        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                type="LIFE_EVENT"
            />
        );

        fireEvent.click(screen.getByText("Generate Events"));
        await waitFor(() => screen.getByText("New Event with Tags"));
        fireEvent.click(screen.getByText("Add"));

        expect(mockActions.addTag).toHaveBeenCalledTimes(2);
        expect(mockActions.addTag).toHaveBeenCalledWith(expect.objectContaining({ id: "NEW_TAG" }));
        expect(mockActions.addTag).toHaveBeenCalledWith(expect.objectContaining({ id: "ANOTHER_NEW_TAG" }));
    });
});