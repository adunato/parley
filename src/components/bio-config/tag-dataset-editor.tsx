import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagEntityEditor } from './tag-entity-editor';
import { Tag, BioData } from '@/lib/generator/types';
import { Badge } from "@/components/ui/badge";
import { getTagRelationships } from '@/lib/generator/tag-utils';

interface TagDatasetEditorProps {
    tags: Tag[];
    bioData: BioData;
    onAdd: (tag: Tag) => void;
    onUpdate: (tag: Tag, oldId: string) => void;
    onDelete: (id: string) => void;
}

export function TagDatasetEditor({ tags, bioData, onAdd, onUpdate, onDelete }: TagDatasetEditorProps) {
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<Tag | undefined>(undefined);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const filteredData = tags.filter(item =>
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    const existingIds = tags.map(i => i.id);

    const handleCreate = () => {
        setEditingItem(undefined);
        setEditorMode('create');
        setIsEditorOpen(true);
    };

    const handleEdit = (item: Tag) => {
        setEditingItem(item);
        setEditorMode('edit');
        setIsEditorOpen(true);
    };

    const handleDuplicate = (item: Tag) => {
        const copy = {
            ...item,
            id: `${item.id}_copy`
        };
        setEditingItem(copy);
        setEditorMode('create');
        setIsEditorOpen(true);
    };

    const handleSave = (item: Tag) => {
        if (editorMode === 'edit' && editingItem) {
            onUpdate(item, editingItem.id);
        } else {
            onAdd(item);
        }
    const handleDelete = (id: string) => {
        const rels = getTagRelationships(id, bioData);
        const hasRefs = rels.providedBy.length > 0 || rels.requiredBy.length > 0 || rels.influences.length > 0;

        if (hasRefs) {
            const confirmMsg = `This tag is referenced by ${rels.providedBy.length + rels.requiredBy.length + rels.influences.length} entities. Deleting it will leave these references dangling. Are you sure?`;
            if (!window.confirm(confirmMsg)) return;
        } else {
            if (!window.confirm('Are you sure you want to delete this tag?')) return;
        }
        onDelete(id);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Tags</h2>
                    <p className="text-sm text-muted-foreground">Manage character state tags and their relationships.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Tag
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Search tags..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">ID</TableHead>
                            <TableHead>Provided by</TableHead>
                            <TableHead>Required by</TableHead>
                            <TableHead>Influences</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No tags found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((tag) => {
                                const rels = getTagRelationships(tag.id, bioData);
                                return (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-mono text-xs">{tag.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {rels.providedBy.map(id => (
                                                    <Badge key={id} variant="secondary" className="text-[10px] px-1 py-0">{id}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {rels.requiredBy.map(id => (
                                                    <Badge key={id} variant="outline" className="text-[10px] px-1 py-0">{id}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {rels.influences.map(inf => (
                                                    <Badge key={inf} variant="outline" className="text-[10px] px-1 py-0 border-orange-200 bg-orange-50 text-orange-700">
                                                        {inf}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(tag)} title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDuplicate(tag)} title="Duplicate">
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tag.id)} title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <TagEntityEditor
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                initialData={editingItem}
                onSave={handleSave}
                existingIds={existingIds}
                mode={editorMode}
            />
        </div>
    );
}
