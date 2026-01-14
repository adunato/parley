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
import { BioGraphProvider } from "./bio-graph-context";
import { BioGraphGuide } from './bio-graph-guide';
import { BioEntityEditor } from './bio-entity-editor';

export function BioGraphView() {
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

    // 3. Layout Function
    const performLayout = () => {
        // Need to pass updated data structure to graph utils. 
        // Note: graph-utils will also need updating to expect childhood/formative/professional
        const layouted = buildBioGraph(bioData, layoutMode, centerId);

        // Inject onEdit and onReorganize callback
        const nodesWithEdit = layouted.nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onEdit: (item: any) => {
                    setEditingEntity({ item, type: node.data.type });
                },
                onReorganize: (id: string) => {
                    console.log(`[BioGraphView] onReorganize triggers. Setting mode=centric, centerId=${id}`);
                    setLayoutMode('centric');
                    setCenterId(id);
                }
            }
        }));

        setNodes(nodesWithEdit);
        setEdges(layouted.edges);
    };

    // 4. Effect: Re-layout on data change OR layout mode change
    useEffect(() => {
        console.log(`[BioGraphView] Effect runs. Mode=${layoutMode}, Center=${centerId}`);
        performLayout();
    }, [bioData.childhood, bioData.formative, bioData.professional, bioData.senior, bioData.lifeEvents, bioData.tags, layoutMode, centerId]);

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

    // Listen for fullscreen change (ESC key)
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

        const type = editingEntity.type; // CHILDHOOD, FORMATIVE, PROFESSIONAL, SENIOR, LIFE_EVENT

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
            const idx = list.findIndex(i => i.id === editingEntity.item.id); // Match by original ID
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

    // Graph Config
    const nodeTypes = useMemo(() => ({ bioNode: BioNode }), []);

    return (
        <BioGraphProvider edges={edges}>
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
                    <Panel position="top-right">
                        <Button size="sm" variant="outline" onClick={() => {
                            setLayoutMode('default');
                            setCenterId(undefined);
                            // performLayout called via effect
                        }}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reset Layout
                        </Button>
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
        </BioGraphProvider>
    );
}