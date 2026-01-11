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

    // 3. Layout Function
    const performLayout = () => {
        const layouted = buildBioGraph(bioData);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
    };

    // 4. Effect: Re-layout on data change
    useEffect(() => {
        performLayout();
    }, [bioData.origins, bioData.education, bioData.careers]);

    // Graph Config
    const nodeTypes = useMemo(() => ({ bioNode: BioNode }), []);

    return (
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
    );
}
