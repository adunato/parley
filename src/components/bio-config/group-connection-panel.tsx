import { useState, useMemo } from 'react';
import { useBioStore } from "@/lib/store/bioStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Link as LinkIcon } from "lucide-react";
import { stringToColor, stringToLightColor } from "@/lib/utils/colors";
import { SlotType } from '@/lib/generator/types';

export function GroupConnectionPanel() {
    const store = useBioStore();
    const { groups, connectGroups } = store;

    // Selection State
    const [sourceIds, setSourceIds] = useState<Set<string>>(new Set());
    const [targetIds, setTargetIds] = useState<Set<string>>(new Set());

    // Config State
    const [connectionType, setConnectionType] = useState<'HARD' | 'SOFT'>('HARD');
    const [customTag, setCustomTag] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Helpers ---

    const getGroupPhaseOrder = (groupId: string): number => {
        // lower is earlier
        if (store.childhood.some(i => i.groupId === groupId)) return 0;
        if (store.formative.some(i => i.groupId === groupId)) return 1;
        if (store.professional.some(i => i.groupId === groupId)) return 2;
        if (store.senior.some(i => i.groupId === groupId)) return 3;
        return 4; // Empty or Unknown
    };

    const sortedGroups = useMemo(() => {
        return [...groups].sort((a, b) => {
            const phaseA = getGroupPhaseOrder(a.id);
            const phaseB = getGroupPhaseOrder(b.id);
            if (phaseA !== phaseB) return phaseA - phaseB;
            return a.name.localeCompare(b.name);
        });
    }, [groups, store.childhood, store.formative, store.professional, store.senior]);

    const handleToggle = (id: string, isSource: boolean) => {
        const setFn = isSource ? setSourceIds : setTargetIds;
        const currentSet = isSource ? sourceIds : targetIds;

        const newSet = new Set(currentSet);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setFn(newSet);
    };

    const handleConnect = () => {
        if (sourceIds.size === 0 || targetIds.size === 0) return;

        connectGroups(
            Array.from(sourceIds),
            Array.from(targetIds),
            {
                type: connectionType,
                tagName: customTag.trim() || undefined
            }
        );

        setSuccessMessage(`Connected ${sourceIds.size} groups to ${targetIds.size} groups.`);

        // Reset after 3s
        setTimeout(() => setSuccessMessage(''), 3000);

        // Optional: Clear selection? No, user might want to do more with same selection.
    };

    const renderGroupList = (isSource: boolean) => {
        return (
            <div className="border rounded-md p-2 h-[300px] overflow-y-auto space-y-1">
                {sortedGroups.map(group => {
                    const isSelected = isSource ? sourceIds.has(group.id) : targetIds.has(group.id);
                    const phaseOrder = getGroupPhaseOrder(group.id);
                    const phaseLabel = ['Childhood', 'Formative', 'Professional', 'Senior', 'Empty'][phaseOrder];

                    return (
                        <div
                            key={group.id}
                            className={`
                                flex items-center justify-between p-2 rounded cursor-pointer border
                                ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}
                            `}
                            onClick={() => handleToggle(group.id, isSource)}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: stringToColor(group.id) }}
                                />
                                <span className="text-sm font-medium">{group.name}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-primary" />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div>
                    <Label className="mb-2 block font-semibold text-muted-foreground text-xs uppercase tracking-wider">From (Sources)</Label>
                    {renderGroupList(true)}
                </div>

                <div className="flex flex-col items-center justify-center text-muted-foreground px-2">
                    <ArrowRight className="w-6 h-6" />
                </div>

                <div>
                    <Label className="mb-2 block font-semibold text-muted-foreground text-xs uppercase tracking-wider">To (Targets)</Label>
                    {renderGroupList(false)}
                </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label>Connection Type</Label>
                        <RadioGroup
                            value={connectionType}
                            onValueChange={(v) => setConnectionType(v as 'HARD' | 'SOFT')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="HARD" id="r-hard" />
                                <Label htmlFor="r-hard" className="font-normal cursor-pointer">
                                    <span className="font-semibold block">Requirement</span>
                                    <span className="text-xs text-muted-foreground">Target requires Source</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="SOFT" id="r-soft" />
                                <Label htmlFor="r-soft" className="font-normal cursor-pointer">
                                    <span className="font-semibold block">Weight</span>
                                    <span className="text-xs text-muted-foreground">Target is more likely</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Bridge Tag (Optional)</Label>
                        <Input
                            placeholder="Auto-generated if empty"
                            value={customTag}
                            onChange={e => setCustomTag(e.target.value)}
                            className="font-mono text-xs"
                        />
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium transition-opacity duration-300" style={{ opacity: successMessage ? 1 : 0 }}>
                        {successMessage || "Saved!"}
                    </span>
                    <Button
                        onClick={handleConnect}
                        disabled={sourceIds.size === 0 || targetIds.size === 0}
                    >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect Nodes
                    </Button>
                </div>
            </div>
        </div>
    );
}
