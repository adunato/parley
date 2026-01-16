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

const mockAddChildhood = jest.fn();
const mockAddLifeEvent = jest.fn();

jest.mock("@/lib/store/bioStore", () => ({
  useBioStore: (selector: any) => {
    const state = {
      addLifeEvent: mockAddLifeEvent,
      addChildhood: mockAddChildhood,
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
        // This test will likely fail because the current component only knows addLifeEvent
        // We'll need to pass the target type or infer it.
        
        render(
            <GenerateEventsDialog 
                open={true} 
                onOpenChange={jest.fn()} 
                // We'll probably need a new prop like 'targetType' or similar
                // But let's see if we can use sourceEntity or if we need to add a prop.
            />
        );

        // Trigger generation
        fireEvent.click(screen.getByText("Generate Events"));

        await waitFor(() => {
            expect(screen.getByText("Generated Spine Node")).toBeInTheDocument();
        });

        // Click Add
        fireEvent.click(screen.getByText("Add"));

        // Expect addChildhood to be called if we were in Childhood context
        // Currently it will call addLifeEvent
        expect(mockAddChildhood).toHaveBeenCalled();
    });
});
