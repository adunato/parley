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
import { RefreshCcw, Maximize, Minimize, SlidersHorizontal } from "lucide-react";

import { BioNode } from "@/components/bio-config/bio-node";
import { useBioGraphContext } from "./bio-graph-context";
import { BioGraphGuide } from './bio-graph-guide';
import { stringToColor } from "@/lib/utils/colors";
import { BioEntityEditor } from './bio-entity-editor';
import { BioGraphFilterToolbar } from './bio-graph-filter-toolbar';
import { ConnectionSelectionDialog, ConnectionDialogState } from './connection-selection-dialog';
import { Connection } from 'reactflow';

import { nodeTypes, edgeTypes } from './graph-config';
import { BioGraphSettingsDialog } from './bio-graph-settings-dialog';

export function BioGraphContent() {
    // 1. Get Data
    const bioData = useBioStore(useShallow(state => ({
        childhood: state.childhood,
        formative: state.formative,
        professional: state.professional,
        senior: state.senior,
        lifeEvents: state.lifeEvents,
        tags: state.tags,
        groups: state.groups
    })));

    const graphSettings = useBioStore(state => state.graphSettings);

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Connection Dialog State
    const [connectionDialog, setConnectionDialog] = useState<ConnectionDialogState | null>(null);

    // Context State
    const {
        hiddenPhases,
        hiddenTypes,
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
        const layouted = buildBioGraph(filteredData, layoutMode, centerId, graphSettings);

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

        setEdges(layouted.edges);
    };

    // 4. Effect: Re-layout on data change OR layout mode change OR filters change
    useEffect(() => {
        performLayout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        bioData.childhood, bioData.formative, bioData.professional, bioData.senior, bioData.lifeEvents, bioData.tags,
        layoutMode, centerId,
        hiddenPhases, hiddenTypes,
        graphSettings // Re-run layout when settings change
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
            tags: [...bioData.tags],
            groups: [...bioData.groups]
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

    // Handle Connection
    const onConnect = (params: Connection) => {
        if (!params.source || !params.target) return;
        if (params.source === params.target) return; // Self-connection check

        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        if (!sourceNode || !targetNode) return;

        const sourceItem = sourceNode.data.item;
        const targetItem = targetNode.data.item;

        // 1. Identify Candidate Tags
        // Must be in Source.provides AND NOT in (Target.requires OR Target.weights)
        const providedTags = sourceItem.provides || [];
        const existingRequires = (targetItem.requires || []) as string[];
        const existingWeights = Object.keys(targetItem.weights || {});

        const candidates = providedTags.filter((tag: string) =>
            !existingRequires.includes(tag) &&
            !existingWeights.includes(tag)
        );

        if (candidates.length === 0) {
            console.log("No connectable tags found", {
                description: `${params.source} provides no tags that are missing from ${params.target}.`
            });
            return;
        }

        // 2. Open Dialog
        setConnectionDialog({
            open: true,
            sourceId: params.source,
            targetId: params.target,
            candidateTags: candidates,
            onCancel: () => setConnectionDialog(null),
            onConfirm: (tag, category, weightValue) => {
                handleApplyConnection(targetNode.data.type, targetItem.id, tag, category, weightValue);
                setConnectionDialog(null);
            }
        });
    };

    const handleApplyConnection = (targetType: string, targetId: string, tag: string, category: 'requires' | 'weights', weightValue?: number) => {
        // Create deep copy of current lists to modify
        const newData = {
            childhood: [...bioData.childhood],
            formative: [...bioData.formative],
            professional: [...bioData.professional],
            senior: [...(bioData.senior || [])],
            lifeEvents: [...bioData.lifeEvents],
            tags: [...bioData.tags],
            groups: [...bioData.groups]
        };

        // Helper to update list
        const updateTarget = (list: any[]) => {
            const idx = list.findIndex(i => i.id === targetId);
            if (idx >= 0) {
                const item = { ...list[idx] };

                if (category === 'requires') {
                    // Initialize if missing
                    if (!item.requires) item.requires = [];
                    // Add tag
                    if (!item.requires.includes(tag)) {
                        item.requires = [...item.requires, tag];
                    }
                } else if (category === 'weights') {
                    // Initialize if missing
                    if (!item.weights) item.weights = {};
                    // Add weight
                    item.weights = { ...item.weights, [tag]: weightValue || 10 };
                }

                list[idx] = item;
            }
        };

        if (targetType === 'CHILDHOOD') updateTarget(newData.childhood);
        if (targetType === 'FORMATIVE') updateTarget(newData.formative);
        if (targetType === 'PROFESSIONAL') updateTarget(newData.professional);
        if (targetType === 'SENIOR') updateTarget(newData.senior);
        if (targetType === 'LIFE_EVENT') updateTarget(newData.lifeEvents);

        setData(newData);
        console.log("Connection Created", {
            description: `Added ${tag} to ${targetId} as ${category}.`
        });
    };

    // 4. Effect: Re-layout on data change OR layout mode change OR filters change

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
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
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
                <Panel position="top-right" className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                        setLayoutMode('default');
                        setCenterId(undefined);
                    }}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset Layout
                    </Button>
                    <Button size="icon" variant="outline" className="w-9 h-9" onClick={() => setIsSettingsOpen(true)} title="Graph Settings">
                        <SlidersHorizontal className="w-4 h-4" />
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

            <ConnectionSelectionDialog state={connectionDialog} />

            <BioGraphSettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                container={isFullScreen ? graphContainerRef.current : null}
            />

            <BioGraphGuide />
        </div>
    );
}