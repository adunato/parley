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

        // Shift position so it centers the node? Dagre gives center point.
        node.position = {
            x: nodeWithPosition.x - NODE_WIDTH / 2,
            y: nodeWithPosition.y - NODE_HEIGHT / 2,
        };
    });

    return { nodes, edges };
};

// --- Centric Layout Algorithm ---
const getCentricLayout = (nodes: Node[], edges: Edge[], centerId: string) => {
    // 1. Determine Levels via BFS/Traversal relative to Center (Level 0)
    // Upstream (Sources) = Negative Levels
    // Downstream (Targets) = Positive Levels

    const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, n]));
    const levels = new Map<string, number>();
    levels.set(centerId, 0);

    // Build Adjacency
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    edges.forEach(e => {
        if (!outgoing.has(e.source)) outgoing.set(e.source, []);
        if (!incoming.has(e.target)) incoming.set(e.target, []);
        outgoing.get(e.source)?.push(e.target);
        incoming.get(e.target)?.push(e.source);
    });

    // BFS Downstream (Positive)
    const queueDown: { id: string, lvl: number }[] = [{ id: centerId, lvl: 0 }];
    const visitedDown = new Set<string>([centerId]);

    while (queueDown.length > 0) {
        const { id, lvl } = queueDown.shift()!;
        const targets = outgoing.get(id) || [];
        targets.forEach(t => {
            if (!visitedDown.has(t)) {
                visitedDown.add(t);
                levels.set(t, (levels.get(t) !== undefined ? Math.min(levels.get(t)!, lvl + 1) : lvl + 1));
                queueDown.push({ id: t, lvl: lvl + 1 });
            }
        });
    }

    // BFS Upstream (Negative)
    const queueUp: { id: string, lvl: number }[] = [{ id: centerId, lvl: 0 }];
    const visitedUp = new Set<string>([centerId]);

    while (queueUp.length > 0) {
        const { id, lvl } = queueUp.shift()!;
        const sources = incoming.get(id) || [];
        sources.forEach(s => {
            if (!visitedUp.has(s)) {
                visitedUp.add(s);
                // If already set by downstream (loop?), usually we prefer downstream logic, but here we want upstream to be negative.
                // Simple implementation: Just set it.
                levels.set(s, lvl - 1);
                queueUp.push({ id: s, lvl: lvl - 1 });
            }
        });
    }

    // 2. Assign Positions
    // Group nodes by level
    const nodesByLevel = new Map<number, string[]>();
    nodes.forEach(n => {
        const lvl = levels.get(n.id);
        // If unconnected to center, put them at Level 0
        const safeLvl = lvl !== undefined ? lvl : 0;
        if (!nodesByLevel.has(safeLvl)) nodesByLevel.set(safeLvl, []);
        nodesByLevel.get(safeLvl)?.push(n.id);
    });

    const LEVEL_X_SPACING = 500;
    const NODE_Y_SPACING = 300;

    nodesByLevel.forEach((ids, lvl) => {
        ids.sort(); // Deterministic order

        const count = ids.length;
        const totalHeight = count * NODE_Y_SPACING;
        const startY = -(totalHeight / 2) + (NODE_Y_SPACING / 2);

        ids.forEach((id, index) => {
            const node = nodeMap.get(id);
            if (node) {
                node.position = {
                    x: lvl * LEVEL_X_SPACING,
                    y: startY + (index * NODE_Y_SPACING)
                };

                // Set logic specific handles? 
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });
    });

    return { nodes, edges };
};

export function buildBioGraph(data: BioData, layoutMode: 'default' | 'centric' = 'default', centerId?: string) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Helper to add node
    const addNode = (item: EventNode | LifeEvent, type: string) => {
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

    console.log(`[buildBioGraph] Mode=${layoutMode}, Center=${centerId}`);
    if (layoutMode === 'centric' && centerId) {
        console.log(`[buildBioGraph] Calling getCentricLayout`);
        return getCentricLayout(nodes, edges, centerId);
    }

    return getLayoutedElements(nodes, edges);
}
