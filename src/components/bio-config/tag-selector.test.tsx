/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagSelector } from "./tag-selector";

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

describe("TagSelector", () => {
  it("renders with placeholder and handles value change", () => {
    const onValueChange = jest.fn();
    render(
      <TagSelector
        value=""
        onValueChange={onValueChange}
        placeholder="Search tags..."
      />
    );

    const input = screen.getByPlaceholderText("Search tags...");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "N" } });
    expect(onValueChange).toHaveBeenCalledWith("N");
  });

  it("shows suggestions when focused with empty value", () => {
    render(
      <TagSelector
        value=""
        onValueChange={jest.fn()}
        placeholder="Search tags..."
      />
    );

    const input = screen.getByPlaceholderText("Search tags...");
    fireEvent.focus(input);

    // CommandItem with ALREADY_EXISTS should be visible
    expect(screen.getByText("ALREADY_EXISTS")).toBeInTheDocument();
  });
});
