import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BioEntityEditor } from './bio-entity-editor';
import { AgePhase, EventNode, LifeEvent, SlotType } from '@/lib/generator/types';
import { Badge } from "@/components/ui/badge";
import { useBioStore } from "@/lib/store/bioStore";

interface BioDatasetEditorProps {
    data: (EventNode | LifeEvent)[];
    type: 'ORIGIN' | 'EDUCATION' | 'CAREER' | 'LIFE_EVENT'; // The target type for new items
    phase?: AgePhase; // The active phase context
    onAdd: (item: any) => void;
    onUpdate: (item: any) => void;
    onDelete: (id: string) => void;
    title: string;
    description: string;
}

export function BioDatasetEditor({ data, type, phase, onAdd, onUpdate, onDelete, title, description }: BioDatasetEditorProps) {
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<EventNode | LifeEvent | undefined>(undefined);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const filteredData = data.filter(item =>
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.text.toLowerCase().includes(search.toLowerCase())
    );

    const existingIds = data.map(i => i.id);

    const handleCreate = () => {
        setEditingItem(undefined);
        setEditorMode('create');
        setIsEditorOpen(true);
    };

    const handleEdit = (item: EventNode | LifeEvent) => {
        setEditingItem(item);
        setEditorMode('edit');
        setIsEditorOpen(true);
    };

    const handleDuplicate = (item: EventNode | LifeEvent) => {
        // Create a copy with a suffixed ID
        const copy = {
            ...item,
            id: `${item.id}_copy`
        };
        setEditingItem(copy);
        setEditorMode('create'); // Treat as create so checks work correctly
        setIsEditorOpen(true);
    };

    const handleSave = (item: EventNode | LifeEvent) => {
        // Automatically register tags in the global database
        const tagsToRegister = new Set<string>();
        item.provides?.forEach(t => tagsToRegister.add(t));
        if ('requires' in item) item.requires?.forEach(t => tagsToRegister.add(t));
        if (item.weights) {
            Object.keys(item.weights).forEach(t => {
                if (t !== 'DEFAULT') tagsToRegister.add(t);
            });
        }
        if (tagsToRegister.size > 0) {
            useBioStore.getState().registerTags(Array.from(tagsToRegister));
        }

        if (editorMode === 'edit' && editingItem) {
            // Check for ID Rename
            if (editingItem.id !== item.id) {
                // Renamed: Delete old + Add new
                onDelete(editingItem.id);
                onAdd(item);
            } else {
                // Same ID: Update
                onUpdate(item);
            }
        } else {
            // Create (New or Duplicate)
            onAdd(item);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New {type === 'LIFE_EVENT' ? 'Event' : 'Entry'}
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">ID</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Age Phases</TableHead>
                            <TableHead>Provides</TableHead>
                            <TableHead>Requires</TableHead>
                            <TableHead>Influenced by</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-[10px] break-all">{item.id}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={item.text}>
                                        {item.text}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {('phase' in item && item.phase) && (
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                                    {item.phase}
                                                </Badge>
                                            )}
                                            {('phases' in item && item.phases) && item.phases.map(p => (
                                                <Badge key={p} variant="outline" className="text-[10px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                                    {p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.provides?.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>
                                            ))}
                                            {(item.provides?.length || 0) > 3 && (
                                                <span className="text-xs text-muted-foreground">+{item.provides!.length - 3}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {'requires' in item && item.requires && (
                                            <div className="flex flex-wrap gap-1">
                                                {item.requires.slice(0, 3).map(t => (
                                                    <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                                                ))}
                                                {(item.requires.length || 0) > 3 && (
                                                    <span className="text-xs text-muted-foreground">+{item.requires.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(item.weights || {}).map(([tag, weight]) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 border-blue-200 bg-blue-50 text-blue-700">
                                                    {tag}:{weight}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)} title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDuplicate(item)} title="Duplicate">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)} title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <BioEntityEditor
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                initialData={editingItem}
                onSave={handleSave}
                type={type}
                phase={phase}
                existingIds={existingIds}
                mode={editorMode}
            />
        </div>
    );
}
