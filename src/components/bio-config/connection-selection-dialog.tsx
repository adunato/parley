"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface ConnectionDialogState {
    open: boolean;
    sourceId: string;
    targetId: string;
    candidateTags: string[];
    // We pass the resolved callback to the parent to handle the actual update
    onConfirm: (tag: string, category: 'requires' | 'weights', weightValue?: number) => void;
    onCancel: () => void;
}

interface ConnectionSelectionDialogProps {
    state: ConnectionDialogState | null;
}

export function ConnectionSelectionDialog({ state }: ConnectionSelectionDialogProps) {
    const [selectedTag, setSelectedTag] = useState<string>("");
    const [category, setCategory] = useState<'requires' | 'weights'>('requires');
    const [weightValue, setWeightValue] = useState<number>(10);

    // Reset state when dialog opens with new props relies on the parent managing the 'state' object key or similar,
    // but since we are controlled, we can use useMemo to set defaults if needed, or useEffect.
    // However, simplest is to update local state when 'state' changes. 
    // We'll use a key on the Dialog content or just useEffect.
    useMemo(() => {
        if (state) {
            if (state.candidateTags.length === 1) {
                setSelectedTag(state.candidateTags[0]);
            } else {
                setSelectedTag("");
            }
            setCategory('requires'); // Default
            setWeightValue(10);
        }
    }, [state]);

    if (!state) return null;

    const isValid = selectedTag && (category === 'requires' || (category === 'weights' && weightValue > 0));

    const handleConfirm = () => {
        if (isValid) {
            state.onConfirm(selectedTag, category, weightValue);
        }
    };

    return (
        <Dialog open={state.open} onOpenChange={(open) => !open && state.onCancel()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Entities</DialogTitle>
                    <DialogDescription>
                        Create a dependency or relationship from <span className="font-mono font-bold text-foreground">{state.sourceId}</span> to <span className="font-mono font-bold text-foreground">{state.targetId}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Tag Selection */}
                    <div className="space-y-2">
                        <Label>Tag to Connect</Label>
                        {state.candidateTags.length === 1 ? (
                            <div className="p-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                <span className="font-mono text-sm">{state.candidateTags[0]}</span>
                                <Badge variant="secondary">Single Option</Badge>
                            </div>
                        ) : (
                            <Select value={selectedTag} onValueChange={setSelectedTag}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tag..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.candidateTags.map(tag => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        <Label>Connection Type</Label>
                        <RadioGroup
                            value={category}
                            onValueChange={(v: 'requires' | 'weights') => setCategory(v)}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="requires" id="requires" className="peer sr-only" />
                                <Label
                                    htmlFor="requires"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <span className="text-sm font-semibold">Requires</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">Hard Dependency</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="weights" id="weights" className="peer sr-only" />
                                <Label
                                    htmlFor="weights"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <span className="text-sm font-semibold">Weight</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">Relative Probability</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Weight Value Input */}
                    {category === 'weights' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="weight-value">Weight Modifier</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="weight-value"
                                    type="number"
                                    value={weightValue}
                                    onChange={(e) => setWeightValue(Number(e.target.value))}
                                    min={1}
                                    className="w-full"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Higher weight increases the chance of <strong>{state.targetId}</strong> appearing if <strong>{selectedTag}</strong> is present.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={state.onCancel}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!isValid}>Confirm Connection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
