"use client";

import { useMemo, useEffect, useState, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    ControlButton,
    MiniMap,
    useNodesState,
    useEdgesState,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useBioStore } from '@/lib/store/bioStore';
import { buildBioGraph } from '@/lib/generator/graph-utils';
import { useShallow } from 'zustand/react/shallow';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Maximize, Minimize } from "lucide-react";

import { BioNode } from "@/components/bio-config/bio-node";
import { useBioGraphContext } from "./bio-graph-context";
import { BioGraphGuide } from './bio-graph-guide';
import { BioEntityEditor } from './bio-entity-editor';
import { BioGraphFilterToolbar } from './bio-graph-filter-toolbar';

export function BioGraphContent() {
    // 1. Get Data
    const bioData = useBioStore(useShallow(state => ({
        childhood: state.childhood,
        formative: state.formative,
        professional: state.professional,
        senior: state.senior,
        lifeEvents: state.lifeEvents,
        tags: state.tags
    })));

    // 2. React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Graph Container Ref
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Edit State
    const [editingEntity, setEditingEntity] = useState<{ item: any, type: string } | null>(null);

    // Layout State
    const [layoutMode, setLayoutMode] = useState<'default' | 'centric'>('default');
    const [centerId, setCenterId] = useState<string | undefined>(undefined);

    // Context State
    const {
        hiddenPhases,
        hiddenTypes,
        highlightedGroupId,
        focusedNodeId,
        setConnectedNodeIds
    } = useBioGraphContext();

    // 3. Layout Function
    const performLayout = () => {
        // Filter Data based on context
        const filteredData = {
            ...bioData,
            childhood: hiddenPhases.has('Childhood') ? [] : bioData.childhood,
            formative: hiddenPhases.has('Formative') ? [] : bioData.formative,
            professional: hiddenPhases.has('Professional') ? [] : bioData.professional,
            senior: hiddenPhases.has('Senior') ? [] : (bioData.senior || []),
            lifeEvents: hiddenTypes.has('LIFE_EVENT') ? [] : bioData.lifeEvents,
        };

        // Note: Graph Utils will need update to handle highlightedGroupId later
        // For now, we just pass filtered data
        const layouted = buildBioGraph(filteredData, layoutMode, centerId);

        // Inject onEdit and onReorganize callback
        const nodesWithEdit = layouted.nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onEdit: (item: any) => {
                    setEditingEntity({ item, type: node.data.type });
                },
                onReorganize: (id: string) => {
                    console.log(`[BioGraphContent] onReorganize triggers. Setting mode=centric, centerId=${id}`);
                    setLayoutMode('centric');
                    setCenterId(id);
                }
            }
        }));

        setNodes(nodesWithEdit);

        // Add Group Edges
        let finalEdges = layouted.edges;
        if (highlightedGroupId) {
            const groupNodes = nodesWithEdit.filter(n => n.data.item.groupId === highlightedGroupId);
            if (groupNodes.length > 1) {
                // Sort by Type (Childhood -> Formative -> Professional -> Senior -> LifeEvent)
                const typeOrder: Record<string, number> = { CHILDHOOD: 0, FORMATIVE: 1, PROFESSIONAL: 2, SENIOR: 3, LIFE_EVENT: 4 };
                groupNodes.sort((a, b) => {
                    const typeA = typeOrder[a.data.type as string] ?? 99;
                    const typeB = typeOrder[b.data.type as string] ?? 99;
                    if (typeA !== typeB) return typeA - typeB;
                    // Secondary sort by ID needed? Maybe just index if same type?
                    return a.id.localeCompare(b.id);
                });

                const groupEdges = [];
                for (let i = 0; i < groupNodes.length - 1; i++) {
                    groupEdges.push({
                        id: `group-edge-${groupNodes[i].id}-${groupNodes[i + 1].id}`,
                        source: groupNodes[i].id,
                        target: groupNodes[i + 1].id,
                        type: 'default',
                        style: { stroke: '#2563eb', strokeWidth: 3, opacity: 0.5, strokeDasharray: '5,5' },
                        animated: true,
                        zIndex: 1000 // Ensure valid property or just ignored? ReactFlow Edge type has zIndex.
                    });
                }
                finalEdges = [...finalEdges, ...groupEdges];
            }
        }

        setEdges(finalEdges);
    };

    // 4. Effect: Re-layout on data change OR layout mode change OR filters change
    useEffect(() => {
        performLayout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        bioData.childhood, bioData.formative, bioData.professional, bioData.senior, bioData.lifeEvents, bioData.tags,
        layoutMode, centerId,
        hiddenPhases, hiddenTypes, highlightedGroupId // Add new dependencies
    ]);

    // 5. Effect: Connected Node Logic (Restored from Provider)
    useEffect(() => {
        if (!focusedNodeId) {
            setConnectedNodeIds(new Set());
            return;
        }

        const visited = new Set<string>();
        visited.add(focusedNodeId);

        // Build adjacency lists for fast traversal
        const outgoing = new Map<string, string[]>();
        const incoming = new Map<string, string[]>();

        edges.forEach(edge => {
            if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
            if (!incoming.has(edge.target)) incoming.set(edge.target, []);

            outgoing.get(edge.source)?.push(edge.target);
            incoming.get(edge.target)?.push(edge.source);
        });

        // Traverse Downstream
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

        // Traverse Upstream
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
    }, [focusedNodeId, edges, setConnectedNodeIds]);


    // Full Screen Handler
    const toggleFullScreen = () => {
        if (!graphContainerRef.current) return;

        if (!document.fullscreenElement) {
            graphContainerRef.current.requestFullscreen()
                .then(() => setIsFullScreen(true))
                .catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
        } else {
            document.exitFullscreen()
                .then(() => setIsFullScreen(false));
        }
    };

    // Listen for fullscreen change
    useEffect(() => {
        const handleChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    // Handle Save from Editor
    const { setData } = useBioStore();
    const handleSaveEntity = (updatedItem: any) => {
        if (!editingEntity) return;

        const type = editingEntity.type;

        // Create deep copy of current lists to modify
        const newData = {
            childhood: [...bioData.childhood],
            formative: [...bioData.formative],
            professional: [...bioData.professional],
            senior: [...(bioData.senior || [])],
            lifeEvents: [...bioData.lifeEvents],
            tags: [...bioData.tags]
        };

        // Helper to update list
        const updateList = (list: any[]) => {
            const idx = list.findIndex(i => i.id === editingEntity.item.id);
            if (idx >= 0) {
                list[idx] = updatedItem;
            } else {
                const originalId = editingEntity.item.id;
                const originalIdx = list.findIndex(i => i.id === originalId);
                if (originalIdx >= 0) list[originalIdx] = updatedItem;
            }
        };

        if (type === 'CHILDHOOD') updateList(newData.childhood);
        if (type === 'FORMATIVE') updateList(newData.formative);
        if (type === 'PROFESSIONAL') updateList(newData.professional);
        if (type === 'SENIOR') updateList(newData.senior);
        if (type === 'LIFE_EVENT') updateList(newData.lifeEvents);
        if (type === 'TAG') updateList(newData.tags);

        setData(newData);
        setEditingEntity(null);
    };

    const nodeTypes = useMemo(() => ({ bioNode: BioNode }), []);

    return (
        <div
            ref={graphContainerRef}
            className={`w-full border rounded-md bg-slate-50 relative ${isFullScreen ? 'h-screen w-screen rounded-none' : 'h-[600px]'}`}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#ccc" gap={20} />
                <Controls>
                    <ControlButton onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                        {isFullScreen ? (
                            <Minimize className="h-4 w-4" />
                        ) : (
                            <Maximize className="h-4 w-4" />
                        )}
                    </ControlButton>
                </Controls>
                <MiniMap nodeStrokeWidth={3} zoomable pannable />

                {/* Top Right: Layout Controls */}
                <Panel position="top-right">
                    <Button size="sm" variant="outline" onClick={() => {
                        setLayoutMode('default');
                        setCenterId(undefined);
                    }}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset Layout
                    </Button>
                </Panel>

                {/* Top Left: Filters */}
                <Panel position="top-left">
                    <BioGraphFilterToolbar />
                </Panel>
            </ReactFlow>

            {editingEntity && (
                <BioEntityEditor
                    open={!!editingEntity}
                    onOpenChange={(open) => !open && setEditingEntity(null)}
                    type={editingEntity.type as any}
                    initialData={editingEntity.item}
                    onSave={handleSaveEntity}
                    existingIds={nodes.map(n => n.id)}
                    mode="edit"
                    container={isFullScreen ? graphContainerRef.current : null}
                />
            )}

            <BioGraphGuide />
        </div>
    );
}