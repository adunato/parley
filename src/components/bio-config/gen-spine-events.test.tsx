/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { BioDatasetEditor } from "./bio-dataset-editor";

// Mock ResizeObserver for cmkd
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("@/lib/store/bioStore", () => {
  return { 
    useBioStore: Object.assign(() => ({
      groups: [],
      tags: []
    }), {
      getState: () => ({
        groups: [],
        tags: [],
        registerTags: jest.fn(),
        addGroup: jest.fn()
      })
    })
  };
});

describe("BioDatasetEditor - Gen Events Button Visibility", () => {
    const types: ('CHILDHOOD' | 'FORMATIVE' | 'PROFESSIONAL' | 'SENIOR')[] = [
        'CHILDHOOD', 'FORMATIVE', 'PROFESSIONAL', 'SENIOR'
    ];

    types.forEach(type => {
        it(`shows "Gen Events" button for ${type} type`, () => {
            render(
                <BioDatasetEditor 
                    data={[]}
                    type={type}
                    onAdd={jest.fn()} 
                    onUpdate={jest.fn()} 
                    onDelete={jest.fn()} 
                    title={`${type} Editor`}
                    description="Test Description" 
                />
            );

            expect(screen.getByText("Gen Events")).toBeInTheDocument();
        });
    });

    it("shows \"Gen Events\" button for LIFE_EVENT type (baseline)", () => {
        render(
            <BioDatasetEditor 
                data={[]}
                type="LIFE_EVENT" 
                onAdd={jest.fn()}
                onUpdate={jest.fn()}
                onDelete={jest.fn()}
                title="Life Events" 
                description="Test Description" 
            />
        );

        expect(screen.getByText("Gen Events")).toBeInTheDocument();
    });
});
