import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BioEntityEditor } from './bio-entity-editor';
import { EventNode, LifeEvent, SlotType } from '@/lib/generator/types';
import { Badge } from "@/components/ui/badge";

interface BioDatasetEditorProps {
    data: (EventNode | LifeEvent)[];
    type: 'ORIGIN' | 'EDUCATION' | 'CAREER' | 'LIFE_EVENT'; // The target type for new items
    onAdd: (item: any) => void;
    onUpdate: (item: any) => void;
    onDelete: (id: string) => void;
    title: string;
    description: string;
}

export function BioDatasetEditor({ data, type, onAdd, onUpdate, onDelete, title, description }: BioDatasetEditorProps) {
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<EventNode | LifeEvent | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const filteredData = data.filter(item =>
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.text.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setEditingItem(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (item: EventNode | LifeEvent) => {
        setEditingItem(item);
        setIsEditorOpen(true);
    };

    const handleSave = (item: EventNode | LifeEvent) => {
        if (editingItem) {
            onUpdate(item);
        } else {
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
                            <TableHead className="w-[200px]">ID</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Provides</TableHead>
                            <TableHead>Requires</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                    <TableCell className="max-w-[400px] truncate" title={item.text}>
                                        {item.text}
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
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)}>
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
            />
        </div>
    );
}
