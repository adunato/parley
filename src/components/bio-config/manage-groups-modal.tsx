import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBioStore } from "@/lib/store/bioStore";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { stringToColor } from "@/lib/utils/colors";
import { BioGroup } from '@/lib/generator/types';

interface ManageGroupsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageGroupsModal({ open, onOpenChange }: ManageGroupsModalProps) {
    const {
        groups, updateGroup, deleteGroup,
        childhood, formative, professional, senior, lifeEvents
    } = useBioStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleStartEdit = (group: BioGroup) => {
        setEditingId(group.id);
        setEditName(group.name);
    };

    const handleSaveEdit = (group: BioGroup) => {
        if (!editName.trim()) return;
        updateGroup({ ...group, name: editName.trim() });
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this group? Items in this group will be un-grouped.')) {
            deleteGroup(id);
        }
    };

    const getGroupCount = (groupId: string) => {
        const lists = [childhood, formative, professional, senior, lifeEvents];
        let count = 0;
        lists.forEach(list => {
            if (list) {
                list.forEach(item => {
                    if (item.groupId === groupId) count++;
                });
            }
        });
        return count;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Groups</DialogTitle>
                    <DialogDescription>
                        View, rename, or delete existing groups.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[400px] overflow-y-auto">
                    {groups.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No groups created yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {groups.map((group) => {
                                const itemCount = getGroupCount(group.id);
                                return (
                                    <div key={group.id} className="flex items-center justify-between p-2 border rounded-md group hover:bg-muted/50 transition-colors">
                                        {editingId === group.id ? (
                                            <div className="flex items-center gap-2 flex-1 mr-2">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="h-8"
                                                    autoFocus
                                                />
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveEdit(group)} title="Save">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={handleCancelEdit} title="Cancel">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: stringToColor(group.id) }}
                                                        title={`Group Color`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{group.name}</span>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{itemCount} items</span>
                                                            {group.description && <span className="border-l pl-2 border-gray-300">{group.description}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEdit(group)} title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(group.id)} title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
