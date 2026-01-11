import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TagListEditor } from './tag-list-editor';
import { WeightEditor } from './weight-editor';
import { EventNode, LifeEvent, SlotType } from '@/lib/generator/types';

interface BioEntityEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: EventNode | LifeEvent;
    onSave: (data: any) => void;
    type: 'ORIGIN' | 'EDUCATION' | 'CAREER' | 'LIFE_EVENT';
    existingIds: string[];
    mode?: 'create' | 'edit';
    container?: HTMLElement | null;
}

export function BioEntityEditor({ open, onOpenChange, initialData, onSave, type, existingIds, mode = 'edit', container }: BioEntityEditorProps) {
    const [id, setId] = useState('');
    const [text, setText] = useState('');
    const [provides, setProvides] = useState<string[]>([]);
    const [requires, setRequires] = useState<string[]>([]);
    const [weights, setWeights] = useState<{ [tag: string]: number; "DEFAULT": number }>({ "DEFAULT": 1 });

    useEffect(() => {
        if (open && initialData) {
            setId(initialData.id);
            setText(initialData.text);
            setProvides(initialData.provides || []);
            setWeights(initialData.weights);

            if ('requires' in initialData) {
                setRequires(initialData.requires || []);
            } else {
                setRequires([]);
            }
        } else if (open) {
            // Reset for new
            setId('');
            setText('');
            setProvides([]);
            setRequires([]);
            setWeights({ "DEFAULT": 1 });
        }
    }, [open, initialData]);

    const isDuplicateId = useMemo(() => {
        if (!id) return false;
        // If we are editing and the ID matches the initial ID, it's not a duplicate (it's the same item)
        // But if we are in 'create' mode, even if it matches initialData (which might be a template), it IS a duplicate if it exists in the list.
        // Wait, validation logic:
        // Collision if: ID exists in list AND ( (Mode is Create) OR (Mode is Edit AND ID != originalID) )
        if (mode === 'edit' && initialData && id === initialData.id) {
            return false;
        }
        return existingIds.includes(id);
    }, [id, existingIds, mode, initialData]);

    const handleSave = () => {
        if (!id || !text || isDuplicateId) return;

        const base = {
            id,
            text,
            provides: provides.length > 0 ? provides : undefined,
            weights
        };

        if (type === 'LIFE_EVENT') {
            onSave(base as LifeEvent);
        } else {
            onSave({
                ...base,
                slot: type as SlotType,
                requires: requires.length > 0 ? requires : undefined
            } as EventNode);
        }
        onOpenChange(false);
    };

    const isEditing = mode === 'edit' && !!initialData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent container={container} className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Entity' : 'New Entity'} ({type})</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ID (Unique)</Label>
                            <Input
                                value={id}
                                onChange={e => setId(e.target.value)}
                                placeholder="my_entity_id"
                                className={isDuplicateId ? "border-red-500" : ""}
                            />
                            {isDuplicateId && (
                                <p className="text-xs text-red-500">ID already exists!</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Narrative Text</Label>
                        <Textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Description of the event..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <TagListEditor
                                label="Provides Tags (Grants)"
                                tags={provides}
                                onChange={setProvides}
                                placeholder="WEALTHY"
                            />

                            {type !== 'LIFE_EVENT' && (
                                <TagListEditor
                                    label="Requires Tags (Prerequisite)"
                                    tags={requires}
                                    onChange={setRequires}
                                    placeholder="DEGREE"
                                />
                            )}
                        </div>

                        <div>
                            <WeightEditor weights={weights} onChange={setWeights} />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!id || !text || isDuplicateId}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
