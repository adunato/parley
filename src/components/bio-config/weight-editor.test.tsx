/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WeightEditor } from "./weight-editor";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("@/lib/store/bioStore", () => ({
  useBioStore: () => ({
    tags: [{ id: "ALREADY_EXISTS" }],
  }),
}));

describe("WeightEditor", () => {
  it("renders default weight and adds new tag weight", () => {
    const onChange = jest.fn();
    const weights: { [tag: string]: number; "DEFAULT": number } = { "DEFAULT": 1 };
    
    render(<WeightEditor weights={weights} onChange={onChange} />);

    expect(screen.getByText("DEFAULT")).toBeInTheDocument();
    
    const tagInput = screen.getByPlaceholderText("TAG_NAME");
    fireEvent.change(tagInput, { target: { value: "speed_bonus" } });
    
    // The "Add" button is the last button with Plus icon
    const addBtn = screen.getAllByRole("button").find(b => b.querySelector(".lucide-plus"));
    if (addBtn) {
        fireEvent.click(addBtn);
        expect(onChange).toHaveBeenCalledWith({ "DEFAULT": 1, "SPEED_BONUS": 1 });
    }
  });
});
