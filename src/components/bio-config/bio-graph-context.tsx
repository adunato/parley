"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface BioGraphContextType {
    highlightedTag: string | null;
    setHighlightedTag: (tag: string | null) => void;
}

const BioGraphContext = createContext<BioGraphContextType | undefined>(undefined);

export function BioGraphProvider({ children }: { children: ReactNode }) {
    const [highlightedTag, setHighlightedTag] = useState<string | null>(null);

    return (
        <BioGraphContext.Provider value={{ highlightedTag, setHighlightedTag }}>
            {children}
        </BioGraphContext.Provider>
    );
}

export function useBioGraphContext() {
    const context = useContext(BioGraphContext);
    if (!context) {
        throw new Error("useBioGraphContext must be used within a BioGraphProvider");
    }
    return context;
}
