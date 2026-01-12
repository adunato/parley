import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag } from '@/lib/generator/types';

interface TagEntityEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Tag;
    onSave: (tag: Tag) => void;
    existingIds: string[];
    mode?: 'create' | 'edit';
}

export function TagEntityEditor({ open, onOpenChange, initialData, onSave, existingIds, mode = 'edit' }: TagEntityEditorProps) {
    const [id, setId] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (open && initialData) {
            setId(initialData.id);
            setDescription(initialData.description || '');
        } else if (open) {
            setId('');
            setDescription('');
        }
    }, [open, initialData]);

    const isDuplicateId = useMemo(() => {
        if (!id) return false;
        if (mode === 'edit' && initialData && id === initialData.id) {
            return false;
        }
        return existingIds.includes(id);
    }, [id, existingIds, mode, initialData]);

    const handleSave = () => {
        if (!id || isDuplicateId) return;

        onSave({
            id,
            description: description || undefined
        });
        onOpenChange(false);
    };

    const isEditing = mode === 'edit' && !!initialData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Tag' : 'New Tag'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tag ID (Unique)</Label>
                        <Input
                            value={id}
                            onChange={e => setId(e.target.value.toUpperCase())}
                            placeholder="e.g. WEALTHY"
                            className={isDuplicateId ? "border-red-500" : ""}
                        />
                        {isDuplicateId && (
                            <p className="text-xs text-red-500">ID already exists!</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What does this tag represent?"
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!id || isDuplicateId}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
