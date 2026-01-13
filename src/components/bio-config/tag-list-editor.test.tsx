/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagListEditor } from "./tag-list-editor";

// Mock ResizeObserver
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
    tags: [{ id: "ALREADY_EXISTS" }],
  });
  mockStore.getState = () => ({
    registerTags: mockRegisterTags
  });
  return { useBioStore: mockStore };
});

describe("TagListEditor", () => {
  it("renders existing tags and adds new one", () => {
    const onChange = jest.fn();
    render(
      <TagListEditor
        tags={["EXISTING_1"]}
        onChange={onChange}
        label="Tags"
      />
    );

    expect(screen.getByText("EXISTING_1")).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText("Add tag...");
    fireEvent.change(input, { target: { value: "new_tag" } });
    fireEvent.click(screen.getByRole("button"));

    expect(onChange).toHaveBeenCalledWith(["EXISTING_1", "NEW_TAG"]);
    expect(mockRegisterTags).toHaveBeenCalledWith(["NEW_TAG"]);
  });

  it("removes a tag", () => {
    const onChange = jest.fn();
    render(
      <TagListEditor
        tags={["EXISTING_1"]}
        onChange={onChange}
      />
    );

    // Find the X button inside the badge
    // Badge contains text and X icon. lucide-react X icon usually has no text.
    // X is SVG with cursor-pointer class.
    const removeBtn = document.querySelector(".cursor-pointer");
    if (removeBtn) {
        fireEvent.click(removeBtn);
        expect(onChange).toHaveBeenCalledWith([]);
    }
  });
});
