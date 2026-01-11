"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Edge } from 'reactflow';

interface BioGraphContextType {
    highlightedTag: string | null;
    setHighlightedTag: (tag: string | null) => void;
    focusedNodeId: string | null;
    setFocusedNodeId: (id: string | null) => void;
    connectedNodeIds: Set<string>;
}

const BioGraphContext = createContext<BioGraphContextType | undefined>(undefined);

export function BioGraphProvider({ children, edges = [] }: { children: ReactNode, edges?: Edge[] }) {
    const [highlightedTag, setHighlightedTag] = useState<string | null>(null);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set());

    // Calculate connected nodes when focusedNodeId changes
    useEffect(() => {
        if (!focusedNodeId) {
            setConnectedNodeIds(new Set());
            return;
        }

        const visited = new Set<string>();
        visited.add(focusedNodeId);

        // Build adjacency lists for fast traversal
        const outgoing = new Map<string, string[]>(); // key -> [targets]
        const incoming = new Map<string, string[]>(); // key -> [sources]

        edges.forEach(edge => {
            if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
            if (!incoming.has(edge.target)) incoming.set(edge.target, []);

            outgoing.get(edge.source)?.push(edge.target);
            incoming.get(edge.target)?.push(edge.source);
        });

        // Traverse Downstream (Descendants)
        const queueDown = [focusedNodeId];
        while (queueDown.length > 0) {
            const current = queueDown.shift()!;
            const targets = outgoing.get(current) || [];
            targets.forEach(t => {
                if (!visited.has(t)) {
                    visited.add(t);
                    queueDown.push(t);
                }
            });
        }

        // Traverse Upstream (Ancestors)
        const queueUp = [focusedNodeId];
        while (queueUp.length > 0) {
            const current = queueUp.shift()!;
            const sources = incoming.get(current) || [];
            sources.forEach(s => {
                if (!visited.has(s)) {
                    visited.add(s);
                    queueUp.push(s);
                }
            });
        }

        setConnectedNodeIds(visited);
    }, [focusedNodeId, edges]);

    return (
        <BioGraphContext.Provider value={{
            highlightedTag,
            setHighlightedTag,
            focusedNodeId,
            setFocusedNodeId,
            connectedNodeIds
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
