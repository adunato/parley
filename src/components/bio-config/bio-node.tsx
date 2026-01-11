import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EventNode, LifeEvent } from "@/lib/generator/types";

// Custom Node Component
export const BioNode = memo(({ data, selected }: NodeProps<{ item: EventNode | LifeEvent, type: string }>) => {
    const { item, type } = data;

    // Type Colors
    const borderColor =
        type === 'ORIGIN' ? 'border-emerald-500' :
            type === 'EDUCATION' ? 'border-blue-500' :
                type === 'CAREER' ? 'border-purple-500' : 'border-gray-500';

    const headerBg =
        type === 'ORIGIN' ? 'bg-emerald-50' :
            type === 'EDUCATION' ? 'bg-blue-50' :
                type === 'CAREER' ? 'bg-purple-50' : 'bg-gray-50';

    return (
        <Card className={cn(
            "w-[280px] shadow-md transition-all duration-200",
            borderColor,
            selected ? "ring-2 ring-primary ring-offset-2" : ""
        )}>
            {/* Input Handle (Left) */}
            {type !== 'ORIGIN' && (
                <Handle type="target" position={Position.Left} className="w-3 h-3 bg-muted-foreground" />
            )}

            <CardHeader className={cn("p-3 py-2 border-b", headerBg)}>
                <CardTitle className="text-sm font-mono font-bold truncate" title={item.id}>
                    {item.id}
                </CardTitle>
                <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                    {type}
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
                                <Badge key={t} variant="outline" className="text-[9px] px-1 py-0 h-4 border-red-200 text-red-700 bg-red-50">
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
                                <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weights (Only show if interesting, i.e. > 1 entry) */}
                {Object.keys(item.weights).length > 1 && (
                    <div className="pt-2 border-t">
                        <div className="text-[10px] text-muted-foreground">
                            {Object.keys(item.weights).length - 1} Special Weight(s)
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Output Handle (Right) */}
            {type !== 'LIFE_EVENT' && type !== 'CAREER' && ( // Careers are usually end nodes in this graph, but could potentiall link to events? For now let's keep it open.
                <Handle type="source" position={Position.Right} className="w-3 h-3 bg-muted-foreground" />
            )}
            {/* Always allow source from career just in case */}
            {type === 'CAREER' && (
                <Handle type="source" position={Position.Right} className="w-3 h-3 bg-muted-foreground" />
            )}
        </Card>
    );
});

BioNode.displayName = "BioNode";
