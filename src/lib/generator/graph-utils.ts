import { Node, Edge, Position, MarkerType } from 'reactflow';
import dagre from 'dagre';
import { EventNode, BioData } from '@/lib/generator/types';

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

    // Edges: Origin -> Education
    // Logic: If Origins provides tags that Education requires
    data.origins.forEach(origin => {
        if (!origin.provides) return;
        const originTags = new Set(origin.provides);

        data.education.forEach(edu => {
            if (!edu.requires) {
                // If education requires NOTHING, does it come from ANY Origin? 
                // Or is it a generic start? 
                // For graph clarity, maybe connects to Generic Origins?
                // Let's only map EXPLICIT dependencies for now to reduce noise.
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
                    width: 240,
                    fontSize: '10px',
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
                    style: { stroke: '#94a3b8' },
                    labelStyle: { fill: '#64748b', fontSize: 10 }
                });
            }
        });
    });

    return getLayoutedElements(nodes, edges);
}
