import { Node, Edge, Position, MarkerType } from 'reactflow';
import dagre from 'dagre';
import { EventNode, BioData, LifeEvent } from '@/lib/generator/types';

// Defaults used if settings are not provided
const DEFAULT_H_SPACING = 300;
const DEFAULT_V_SPACING = 200;
const NODE_WIDTH = 300;
const NODE_HEIGHT = 200;

interface GraphSettings {
    horizontalSpacing: number;
    verticalSpacing: number;
    edgeLabelPosition: number;
}

export const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction = 'LR',
    settings?: GraphSettings
) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Map settings to Dagre parameters
    // LR: ranksep = horizontal, nodesep = vertical
    const rankSep = settings?.horizontalSpacing ?? DEFAULT_H_SPACING;
    const nodeSep = settings?.verticalSpacing ?? DEFAULT_V_SPACING;

    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: rankSep,
        nodesep: nodeSep
    });

    nodes.forEach((node) => {
        // Dagre needs width/height to calculate centers correctly
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

        // Shift position so it centers the node
        node.position = {
            x: nodeWithPosition.x - NODE_WIDTH / 2,
            y: nodeWithPosition.y - NODE_HEIGHT / 2,
        };
    });

    return { nodes, edges };
};

// --- Centric Layout Algorithm ---
const getCentricLayout = (
    nodes: Node[],
    edges: Edge[],
    centerId: string,
    settings?: GraphSettings
) => {
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
                // Keep the 'closest' level (lowest absolute value) or farthest?
                // Standard layering usually wants longest path? 
                // For centric, shortest path is fine to keep it compact.
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
                levels.set(s, lvl - 1);
                queueUp.push({ id: s, lvl: lvl - 1 });
            }
        });
    }

    // FILTER: Only include connected nodes (visitedUp U visitedDown)
    const activeIds = new Set([...visitedUp, ...visitedDown]);
    const activeNodes = nodes.filter(n => activeIds.has(n.id));
    const activeEdges = edges.filter(e => activeIds.has(e.source) && activeIds.has(e.target));

    // 2. Assign Positions with Barycenter Heuristic

    // Group by Level
    const nodesByLevel = new Map<number, string[]>();
    let minLvl = 0;
    let maxLvl = 0;

    activeIds.forEach(id => {
        const lvl = levels.get(id)!;
        if (!nodesByLevel.has(lvl)) nodesByLevel.set(lvl, []);
        nodesByLevel.get(lvl)?.push(id);
        if (lvl < minLvl) minLvl = lvl;
        if (lvl > maxLvl) maxLvl = lvl;
    });

    const levelXSpacing = settings?.horizontalSpacing ?? DEFAULT_H_SPACING;
    const nodeYSpacing = settings?.verticalSpacing ?? DEFAULT_V_SPACING;

    // Helper: Get Y position (or 0 if not set yet)
    const getY = (id: string) => nodeMap.get(id)?.position?.y || 0;

    // Initial Place: Level 0 (Center)
    // We assume Level 0 has only ONE node (the center), or multiple if loops?
    // BFS Up/Down from single point -> Level 0 is just centerId.
    const centerNode = nodeMap.get(centerId);
    if (centerNode) centerNode.position = { x: 0, y: 0 };

    // Propagate Right (1 to Max)
    for (let lvl = 1; lvl <= maxLvl; lvl++) {
        const ids = nodesByLevel.get(lvl) || [];

        // Sort by Average Y of Parents (in lvl-1)
        ids.sort((a, b) => {
            const getBarycenter = (nodeId: string) => {
                const parents = incoming.get(nodeId)?.filter(p => levels.get(p) === lvl - 1) || [];
                if (parents.length === 0) return 0;
                const sum = parents.reduce((acc, pid) => acc + getY(pid), 0);
                return sum / parents.length;
            };
            return getBarycenter(a) - getBarycenter(b);
        });

        const count = ids.length;
        const totalHeight = count * nodeYSpacing;
        const startY = -(totalHeight / 2) + (nodeYSpacing / 2);

        ids.forEach((id, index) => {
            const node = nodeMap.get(id);
            if (node) {
                node.position = {
                    x: lvl * levelXSpacing,
                    y: startY + (index * nodeYSpacing)
                };
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });
    }

    // Propagate Left (-1 to Min)
    for (let lvl = -1; lvl >= minLvl; lvl--) {
        const ids = nodesByLevel.get(lvl) || [];

        // Sort by Average Y of Children (in lvl+1)
        ids.sort((a, b) => {
            const getBarycenter = (nodeId: string) => {
                const children = outgoing.get(nodeId)?.filter(c => levels.get(c) === lvl + 1) || [];
                if (children.length === 0) return 0;
                const sum = children.reduce((acc, cid) => acc + getY(cid), 0);
                return sum / children.length;
            };
            return getBarycenter(a) - getBarycenter(b);
        });

        const count = ids.length;
        const totalHeight = count * nodeYSpacing;
        const startY = -(totalHeight / 2) + (nodeYSpacing / 2);

        ids.forEach((id, index) => {
            const node = nodeMap.get(id);
            if (node) {
                node.position = {
                    x: lvl * levelXSpacing,
                    y: startY + (index * nodeYSpacing)
                };
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });
    }

    return { nodes: activeNodes, edges: activeEdges };
};

export function buildBioGraph(
    data: BioData,
    layoutMode: 'default' | 'centric' = 'default',
    centerId?: string,
    settings?: GraphSettings
) {
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

    data.childhood.forEach(o => addNode(o, 'CHILDHOOD'));
    data.formative.forEach(e => addNode(e, 'FORMATIVE'));
    data.professional.forEach(c => addNode(c, 'PROFESSIONAL'));
    data.senior?.forEach(s => addNode(s, 'SENIOR'));
    data.lifeEvents.forEach(e => addNode(e, 'LIFE_EVENT'));

    // EDGE DATA for label positioning
    const edgeData = { labelPosition: settings?.edgeLabelPosition };
    const edgeType = 'configurable'; // Using custom edge type

    // Helper to create edge
    const createEdge = (sourceId: string, targetId: string, label: string, isInfluence = false) => {
        return {
            id: isInfluence ? `influence-${sourceId}-${targetId}` : `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            label: label,
            type: edgeType,
            animated: isInfluence,
            data: edgeData, // Pass settings here
            style: isInfluence
                ? { stroke: '#f97316', strokeDasharray: '5,5', strokeWidth: 1.5 }
                : { stroke: '#94a3b8', strokeWidth: 2 },
            labelStyle: isInfluence
                ? { fill: '#c2410c', fontSize: 10, fontWeight: 600 }
                : { fill: '#1e293b', fontWeight: 800, fontSize: 11 },
            labelShowBg: true,
            labelBgStyle: isInfluence
                ? { fill: '#fff7ed', stroke: '#fdba74', strokeWidth: 1 }
                : { fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 1 },
            labelBgPadding: [4, 2] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isInfluence ? '#f97316' : '#94a3b8',
            },
        };
    };

    // Edges: Childhood -> Formative
    data.childhood.forEach(origin => {
        if (!origin.provides) return;
        const originTags = new Set(origin.provides);

        data.formative.forEach(edu => {
            if (!edu.requires) return;
            const matching = edu.requires.filter(t => originTags.has(t));
            if (matching.length > 0) {
                edges.push(createEdge(origin.id, edu.id, matching.join(', ')));
            }
        });
    });

    // Edges: Formative -> Professional
    data.formative.forEach(edu => {
        if (!edu.provides) return;
        const eduTags = new Set(edu.provides);

        data.professional.forEach(career => {
            if (!career.requires) return;
            const matching = career.requires.filter(t => eduTags.has(t));
            if (matching.length > 0) {
                edges.push(createEdge(edu.id, career.id, matching.join(', ')));
            }
        });
    });

    // Edges: Professional -> Senior
    data.professional.forEach(career => {
        if (!career.provides) return;
        const careerTags = new Set(career.provides);

        data.senior?.forEach(sen => {
            if (!sen.requires) return;
            const matching = sen.requires.filter(t => careerTags.has(t));
            if (matching.length > 0) {
                edges.push(createEdge(career.id, sen.id, matching.join(', ')));
            }
        });
    });

    // --- Helper: Add Influence Edges ---
    const addInfluenceEdges = (sources: EventNode[], targets: (EventNode | LifeEvent)[]) => {
        targets.forEach(target => {
            const weightTags = Object.keys(target.weights);
            if (weightTags.length === 0) return;
            const weightTagsSet = new Set(weightTags);

            sources.forEach(source => {
                if (!source.provides) return;
                const matching = source.provides.filter(t => weightTagsSet.has(t));

                if (matching.length > 0) {
                    const label = matching.map(t => `${t} (x${target.weights[t]})`).join(', ');
                    edges.push(createEdge(source.id, target.id, label, true));
                }
            });
        });
    };

    // 1. Influence: Childhood -> Formative
    addInfluenceEdges(data.childhood, data.formative);

    // 2. Influence: Childhood + Formative -> Professional
    const professionalSources = [...data.childhood, ...data.formative];
    addInfluenceEdges(professionalSources, data.professional);

    // 3. Influence: Professional -> Senior
    const seniorSources = [...data.childhood, ...data.formative, ...data.professional];
    if (data.senior) {
        addInfluenceEdges(seniorSources, data.senior);
    }

    // 4. Influence: Childhood + Formative + Professional + Senior -> Life Events
    const lifeEventSources = [...data.childhood, ...data.formative, ...data.professional, ...(data.senior || [])];
    addInfluenceEdges(lifeEventSources, data.lifeEvents);

    console.log(`[buildBioGraph] Mode=${layoutMode}, Center=${centerId}, Settings=`, settings);
    if (layoutMode === 'centric' && centerId) {
        console.log(`[buildBioGraph] Calling getCentricLayout`);
        return getCentricLayout(nodes, edges, centerId, settings);
    }

    return getLayoutedElements(nodes, edges, 'LR', settings);
}