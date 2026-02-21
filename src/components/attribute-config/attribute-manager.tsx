"use client";

import { useState } from 'react';
import { useEntityStore } from '@/lib/entityStore';
import { GameAttribute, GameAttributeCategory } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AttributeManager() {
    const {
        gameAttributeCategories,
        gameAttributes,
        addGameAttribute,
        updateGameAttribute,
        deleteGameAttribute
    } = useEntityStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    // State for creating new attributes
    const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const handleEditStart = (attr: GameAttribute) => {
        setEditingId(attr.id);
        setEditName(attr.name);
        setEditDesc(attr.description);
        setNewItemCategory(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName("");
        setEditDesc("");
    };

    const handleEditSave = (attr: GameAttribute) => {
        if (!editName.trim()) return;
        updateGameAttribute({
            ...attr,
            name: editName,
            description: editDesc,
        });
        handleEditCancel();
    };

    const handleCreateStart = (categoryId: string) => {
        setNewItemCategory(categoryId);
        setNewName("");
        setNewDesc("");
        setEditingId(null);
    };

    const handleCreateCancel = () => {
        setNewItemCategory(null);
        setNewName("");
        setNewDesc("");
    };

    const handleCreateSave = (categoryId: string) => {
        if (!newName.trim()) return;

        const newAttr: GameAttribute = {
            id: uuidv4(),
            categoryId,
            name: newName,
            description: newDesc,
        };

        addGameAttribute(newAttr);
        handleCreateCancel();
    };

    return (
        <div className="space-y-12">
            {(gameAttributeCategories || []).map((category) => {
                const categoryAttributes = (gameAttributes || []).filter(a => a.categoryId === category.id);

                return (
                    <div key={category.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div>
                                <h2 className="text-xl font-semibold">{category.name}</h2>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                            <Button size="sm" onClick={() => handleCreateStart(category.id)} variant="outline">
                                <Plus className="w-4 h-4 mr-2" /> Add {category.name}
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[30%]">Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categoryAttributes.length === 0 && newItemCategory !== category.id && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                No attributes defined for {category.name}.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {categoryAttributes.map((attr) => (
                                        <TableRow key={attr.id}>
                                            {editingId === attr.id ? (
                                                <>
                                                    <TableCell>
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            placeholder="Name"
                                                            autoFocus
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={editDesc}
                                                            onChange={(e) => setEditDesc(e.target.value)}
                                                            placeholder="Description"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleEditSave(attr)}>
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={handleEditCancel}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="font-medium align-middle">{attr.name}</TableCell>
                                                    <TableCell className="text-muted-foreground align-middle">{attr.description}</TableCell>
                                                    <TableCell className="text-right align-middle">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditStart(attr)}>
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteGameAttribute(attr.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}

                                    {/* New Item Input Row */}
                                    {newItemCategory === category.id && (
                                        <TableRow className="bg-muted/20">
                                            <TableCell>
                                                <Input
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder="New Item Name"
                                                    autoFocus
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={newDesc}
                                                    onChange={(e) => setNewDesc(e.target.value)}
                                                    placeholder="Description (optional)"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleCreateSave(category.id);
                                                        if (e.key === 'Escape') handleCreateCancel();
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleCreateSave(category.id)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={handleCreateCancel}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
