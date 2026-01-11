import { Node, Edge, Position, MarkerType } from 'reactflow';
import dagre from 'dagre';
import { EventNode, BioData, LifeEvent } from '@/lib/generator/types';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 200;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
        node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

        // Shift position so it centers the node? Dagre gives center x/y. ReactFlow uses top/left.
        // Actually, dagre gives center point.
        node.position = {
            x: nodeWithPosition.x - NODE_WIDTH / 2,
            y: nodeWithPosition.y - NODE_HEIGHT / 2,
        };
    });

    return { nodes, edges };
};

export function buildBioGraph(data: BioData) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Helper to add node
    const addNode = (item: EventNode, type: string) => {
        nodes.push({
            id: item.id,
            type: 'bioNode',
            data: {
                item,
                type
            },
            position: { x: 0, y: 0 },
        });
    };

    data.origins.forEach(o => addNode(o, 'ORIGIN'));
    data.education.forEach(e => addNode(e, 'EDUCATION'));
    data.careers.forEach(c => addNode(c, 'CAREER'));
    data.lifeEvents.forEach(e => addNode(e, 'LIFE_EVENT'));

    // Edges: Origin -> Education
    // Logic: If Origins provides tags that Education requires
    data.origins.forEach(origin => {
        if (!origin.provides) return;
        const originTags = new Set(origin.provides);

        data.education.forEach(edu => {
            if (!edu.requires) {
                return;
            }

            const matching = edu.requires.filter(t => originTags.has(t));
            if (matching.length > 0) {
                edges.push({
                    id: `${origin.id}-${edu.id}`,
                    source: origin.id,
                    target: edu.id,
                    label: matching.join(', '),
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    labelStyle: { fill: '#475569', fontWeight: 700, fontSize: 10 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#94a3b8',
                    },
                });
            }
        });
    });

    // Edges: Education -> Career
    data.education.forEach(edu => {
        if (!edu.provides) return;
        const eduTags = new Set(edu.provides);

        data.careers.forEach(career => {
            if (!career.requires) return;

            const matching = career.requires.filter(t => eduTags.has(t));
            if (matching.length > 0) {
                edges.push({
                    id: `${edu.id}-${career.id}`,
                    source: edu.id,
                    target: career.id,
                    label: matching.join(', '),
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    labelStyle: { fill: '#475569', fontWeight: 700, fontSize: 10 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#94a3b8',
                    },
                });
            }
        });
    });

    // --- Helper: Add Influence Edges ---
    // adds dotted orange edges if Source provides a tag that modifies Target's weight
    const addInfluenceEdges = (sources: EventNode[], targets: (EventNode | LifeEvent)[]) => {
        targets.forEach(target => {
            const weightTags = Object.keys(target.weights);
            if (weightTags.length === 0) return;
            const weightTagsSet = new Set(weightTags);

            sources.forEach(source => {
                if (!source.provides) return;

                // Find tags provided by source that affect target's weight
                const matching = source.provides.filter(t => weightTagsSet.has(t));

                if (matching.length > 0) {
                    const label = matching.map(t => `${t} (x${target.weights[t]})`).join(', ');

                    // Check if an edge already exists (e.g. a Requirement edge) related to these two?
                    // actually, Requirement edges are separate logical concepts (Blue solid vs Orange dotted).
                    // We can have both. React Flow handles multiple edges between nodes if ids are unique.

                    edges.push({
                        id: `influence-${source.id}-${target.id}`,
                        source: source.id,
                        target: target.id,
                        label: label,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#f97316', strokeDasharray: '5,5', strokeWidth: 1.5 }, // Orange, dotted
                        labelStyle: { fill: '#ea580c', fontSize: 9 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#f97316',
                        },
                    });
                }
            });
        });
    };

    // 1. Influence: Origin -> Education
    addInfluenceEdges(data.origins, data.education);

    // 2. Influence: Origin + Education -> Career
    // (Careers can be influenced by background or education)
    const careerSources = [...data.origins, ...data.education];
    addInfluenceEdges(careerSources, data.careers);

    // 3. Influence: Origin + Education + Career -> Life Events
    const lifeEventSources = [...data.origins, ...data.education, ...data.careers];
    addInfluenceEdges(lifeEventSources, data.lifeEvents);

    return getLayoutedElements(nodes, edges);
}
