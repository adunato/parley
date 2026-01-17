import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EventNode, LifeEvent } from "@/lib/generator/types";
import { useBioGraphContext } from './bio-graph-context';
import { Pencil, Eye, Network } from 'lucide-react'; // Import Network icon

import { stringToColor } from "@/lib/utils/colors";

// Custom Node Component
export const BioNode = memo(({ data, selected }: NodeProps<{ item: EventNode | LifeEvent, type: string, onEdit?: (item: EventNode | LifeEvent) => void, onReorganize?: (id: string) => void }>) => {
    const { item, type } = data;
    const { highlightedTag, setHighlightedTag, focusedNodeId, setFocusedNodeId, connectedNodeIds } = useBioGraphContext();

    const handleMouseEnter = (tag: string) => setHighlightedTag(tag);
    const handleMouseLeave = () => setHighlightedTag(null);

    // Dims if:
    // 1. A path is focused AND this node is NOT in the connected set.
    // 2. A tag is highlighted AND this node doesn't have it (existing logic).
    const isDimmed = (focusedNodeId !== null && !connectedNodeIds.has(item.id)) ||
        (highlightedTag !== null &&
            !item.provides?.includes(highlightedTag) &&
            !('requires' in item && item.requires?.includes(highlightedTag)) &&
            !Object.keys(item.weights).includes(highlightedTag));

    const groupId = 'groupId' in item ? item.groupId : undefined;
    const groupColor = groupId ? stringToColor(groupId) : undefined;

    // Type Colors
    const borderColor =
        type === 'CHILDHOOD' ? 'border-emerald-500' :
            type === 'FORMATIVE' ? 'border-blue-500' :
                type === 'PROFESSIONAL' ? 'border-purple-500' :
                    type === 'SENIOR' ? 'border-amber-500' :
                        type === 'LIFE_EVENT' ? 'border-orange-500' : 'border-gray-500';

    const headerBg =
        type === 'CHILDHOOD' ? 'bg-emerald-50' :
            type === 'FORMATIVE' ? 'bg-blue-50' :
                type === 'PROFESSIONAL' ? 'bg-purple-50' :
                    type === 'SENIOR' ? 'bg-amber-50' :
                        type === 'LIFE_EVENT' ? 'bg-orange-50' : 'bg-gray-50';

    return (
        <Card
            className={cn(
                "w-[280px] shadow-md transition-all duration-200",
                borderColor,
                selected ? "ring-2 ring-primary ring-offset-2" : "",
                isDimmed ? "opacity-40 grayscale-[0.5]" : ""
            )}
            style={groupColor ? { borderLeftWidth: '6px', borderLeftColor: groupColor } : {}}
        >
            {/* Input Handle (Left) */}
            {/* Input Handle (Left) */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-muted-foreground" />

            <CardHeader className={cn("p-3 py-2 border-b flex flex-row items-center justify-between space-y-0", headerBg)}>
                <div className="flex flex-col overflow-hidden">
                    <CardTitle className="text-sm font-mono font-bold truncate" title={item.id}>
                        {item.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                            {type}
                        </div>
                        {groupId && (
                            <div
                                className="text-[9px] px-1 rounded text-white font-bold truncate max-w-[80px]"
                                style={{ backgroundColor: groupColor }}
                                title={`Group: ${groupId}`}
                            >
                                G
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {data.onReorganize && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log(`[BioNode] Reorganize clicked for ${item.id}`);
                                data.onReorganize!(item.id);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-black/5 rounded"
                            title="Reorganize Graph (Hierarchy View)"
                        >
                            <Network className="h-3.5 w-3.5" />
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Toggle focus
                            if (focusedNodeId === item.id) {
                                setFocusedNodeId(null);
                            } else {
                                setFocusedNodeId(item.id);
                            }
                        }}
                        className={cn(
                            "transition-colors p-1 rounded",
                            focusedNodeId === item.id ? "text-primary bg-primary/10 ring-1 ring-primary" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                        )}
                        title="View Path (Dependencies & Influence)"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>

                    {data.onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onEdit!(item);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-black/5 rounded"
                            title="Edit Entity"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-3 space-y-3">
                {/* Description (Truncated unless selected/hovered? We'll just show 2 lines) */}
                <p className="text-xs text-muted-foreground line-clamp-2" title={item.text}>
                    {item.text}
                </p>

                {/* Requires Tags */}
                {'requires' in item && item.requires && item.requires.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Requires</div>
                        <div className="flex flex-wrap gap-1">
                            {item.requires.map(t => (
                                <Badge
                                    key={t}
                                    variant="outline"
                                    className={cn(
                                        "text-[9px] px-1 py-0 h-4 border-red-200 text-red-700 bg-red-50 cursor-pointer transition-all",
                                        highlightedTag === t ? "ring-2 ring-red-500 scale-110 font-bold bg-red-100" : ""
                                    )}
                                    onMouseEnter={() => handleMouseEnter(t)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Provides Tags */}
                {item.provides && item.provides.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Provides</div>
                        <div className="flex flex-wrap gap-1">
                            {item.provides.map(t => (
                                <Badge
                                    key={t}
                                    variant="secondary"
                                    className={cn(
                                        "text-[9px] px-1 py-0 h-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer transition-all",
                                        highlightedTag === t ? "ring-2 ring-emerald-500 scale-110 font-bold bg-emerald-200" : ""
                                    )}
                                    onMouseEnter={() => handleMouseEnter(t)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weights */}
                {Object.keys(item.weights).length > 0 && (
                    <div className="pt-2 border-t space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Weights</div>
                        <div className="grid grid-cols-2 gap-1">
                            {Object.entries(item.weights).map(([tag, weight]) => (
                                <div
                                    key={tag}
                                    className={cn(
                                        "flex items-center justify-between text-[10px] bg-slate-100 rounded px-1.5 py-0.5 cursor-pointer transition-all",
                                        highlightedTag === tag ? "ring-1 ring-slate-500 bg-slate-200" : ""
                                    )}
                                    title={`${tag}: ${weight}`}
                                    onMouseEnter={() => handleMouseEnter(tag)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <span className="truncate max-w-[80px]">{tag}</span>
                                    <span className="font-mono font-bold text-slate-600">{weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Output Handle (Right) - All Spine nodes can be sources */}
            {/* Output Handle (Right) */}
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-muted-foreground" />
        </Card>
    );
});

BioNode.displayName = "BioNode";