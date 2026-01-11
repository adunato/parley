"use client";

import { useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
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
import { RefreshCcw } from "lucide-react";

import { BioNode } from "@/components/bio-config/bio-node";
import { BioGraphProvider } from "./bio-graph-context";
import { BioGraphGuide } from './bio-graph-guide';
import { BioEntityEditor } from './bio-entity-editor';

export function BioGraphView() {
    // 1. Get Data
    const bioData = useBioStore(useShallow(state => ({
        origins: state.origins,
        education: state.education,
        careers: state.careers,
        lifeEvents: state.lifeEvents
    })));

    // 2. React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Edit State
    const [editingEntity, setEditingEntity] = useNodesState<{ item: any, type: string } | null>(null);

    // 3. Layout Function
    const performLayout = () => {
        const layouted = buildBioGraph(bioData);

        // Inject onEdit callback
        const nodesWithEdit = layouted.nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onEdit: (item: any) => {
                    // Determine type based on where it came from or the node data type
                    // The 'type' was saved in data.type in buildBioGraph
                    setEditingEntity({ item, type: node.data.type });
                }
            }
        }));

        setNodes(nodesWithEdit);
        setEdges(layouted.edges);
    };

    // 4. Effect: Re-layout on data change
    useEffect(() => {
        performLayout();
    }, [bioData.origins, bioData.education, bioData.careers, bioData.lifeEvents]);

    // Handle Save from Editor
    const { setData } = useBioStore();
    const handleSaveEntity = (updatedItem: any) => {
        if (!editingEntity) return;

        const type = editingEntity.type; // ORIGIN, EDUCATION, CAREER, LIFE_EVENT

        // Create deep copy of current lists to modify
        const newData = {
            origins: [...bioData.origins],
            education: [...bioData.education],
            careers: [...bioData.careers],
            lifeEvents: [...bioData.lifeEvents]
        };

        // Helper to update list
        const updateList = (list: any[]) => {
            const idx = list.findIndex(i => i.id === editingEntity.item.id); // Match by original ID
            if (idx >= 0) {
                // Determine if ID changed? That's tricky for references, but assuming ID is key.
                // If ID changed, we might break edges, but graph rebuilds anyway.
                list[idx] = updatedItem;
            } else {
                // If not found (maybe renamed?), push? or error.
                // Ideally we match by old ID. But BioEntityEditor passes new data.
                // We should probably rely on the fact that if we are editing, we replace the one at that index?
                // Actually, let's just find by *old* ID. But wait, updatedItem has new ID.
                // We need to know the original ID if we want to support renaming safely.
                // For now, let's assume we find by the ID passed to the editor (editingEntity.item.id)
                const originalId = editingEntity.item.id;
                const originalIdx = list.findIndex(i => i.id === originalId);
                if (originalIdx >= 0) list[originalIdx] = updatedItem;
            }
        };

        if (type === 'ORIGIN') updateList(newData.origins);
        if (type === 'EDUCATION') updateList(newData.education);
        if (type === 'CAREER') updateList(newData.careers);
        if (type === 'LIFE_EVENT') updateList(newData.lifeEvents);

        setData(newData);
        setEditingEntity(null);
    };

    // Graph Config
    const nodeTypes = useMemo(() => ({ bioNode: BioNode }), []);

    return (
        <BioGraphProvider>
            <div className="h-[600px] w-full border rounded-md bg-slate-50 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#ccc" gap={20} />
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    <Panel position="top-right">
                        <Button size="sm" variant="outline" onClick={performLayout}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reset Layout
                        </Button>
                    </Panel>
                </ReactFlow>
            </div>

            {editingEntity && (
                <BioEntityEditor
                    open={!!editingEntity}
                    onOpenChange={(open) => !open && setEditingEntity(null)}
                    type={editingEntity.type as any}
                    initialData={editingEntity.item}
                    onSave={handleSaveEntity}
                />
            )}

            <BioGraphGuide />
        </BioGraphProvider>
    );
}
