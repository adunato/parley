"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Edge } from 'reactflow';
import { AgePhase } from '@/lib/generator/types';

interface BioGraphContextType {
    highlightedTag: string | null;
    setHighlightedTag: (tag: string | null) => void;
    focusedNodeId: string | null;
    setFocusedNodeId: (id: string | null) => void;
    connectedNodeIds: Set<string>;
    setConnectedNodeIds: (ids: Set<string>) => void; // Exposed

    // Filter State
    hiddenPhases: Set<AgePhase>;
    togglePhaseVisibility: (phase: AgePhase) => void;
    hiddenTypes: Set<string>;
    toggleTypeVisibility: (type: string) => void;

    // Grouping State
    highlightedGroupId: string | null;
    setHighlightedGroupId: (id: string | null) => void;
}

const BioGraphContext = createContext<BioGraphContextType | undefined>(undefined);

export function BioGraphProvider({ children }: { children: ReactNode }) {
    const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set());

    // Filter State
    const [hiddenPhases, setHiddenPhases] = useState<Set<AgePhase>>(new Set());
    const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
    const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null);

    const togglePhaseVisibility = useCallback((phase: AgePhase) => {
        setHiddenPhases(prev => {
            const next = new Set(prev);
            if (next.has(phase)) {
                next.delete(phase);
            } else {
                next.add(phase);
            }
            return next;
        });
    }, []);

    const toggleTypeVisibility = useCallback((type: string) => {
        setHiddenTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    }, []);

    return (
        <BioGraphContext.Provider value={{
            highlightedTag,
            setHighlightedTag,
            focusedNodeId,
            setFocusedNodeId,
            connectedNodeIds,
            setConnectedNodeIds, // Exposed
            hiddenPhases,
            togglePhaseVisibility,
            hiddenTypes,
            toggleTypeVisibility,
            highlightedGroupId,
            setHighlightedGroupId
        }}>
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
