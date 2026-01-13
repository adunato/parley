/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BioPhaseSettings } from "./bio-phase-settings";
import { AGE_PHASES } from "@/lib/generator/types";

const mockUpdatePhaseConfig = jest.fn();

jest.mock("@/lib/store/bioStore", () => ({
  useBioStore: () => ({
    phaseConfig: AGE_PHASES,
    updatePhaseConfig: mockUpdatePhaseConfig
  })
}));

describe("BioPhaseSettings", () => {
    beforeEach(() => {
        mockUpdatePhaseConfig.mockClear();
    });

    it("renders cards for all age phases", () => {
        render(<BioPhaseSettings />);
        
        expect(screen.getByText("Childhood")).toBeInTheDocument();
        expect(screen.getByText("Formative")).toBeInTheDocument();
        expect(screen.getByText("Professional")).toBeInTheDocument();
        expect(screen.getByText("Senior")).toBeInTheDocument();
    });

    it("calls updatePhaseConfig when an input changes", () => {
        render(<BioPhaseSettings />);
        
        // Find the "End Age" input in the Childhood card
        // Childhood card title is "Childhood"
        const childhoodHeader = screen.getByText("Childhood");
        const card = childhoodHeader.closest('.rounded-lg');
        if (!card) throw new Error("Card not found");

        const endAgeInput = card.querySelector('input[value="18"]');
        if (!endAgeInput) throw new Error("Input not found");

        fireEvent.change(endAgeInput, { target: { value: "20" } });
        
        expect(mockUpdatePhaseConfig).toHaveBeenCalledWith("Childhood", { endAge: 20 });
    });
});
