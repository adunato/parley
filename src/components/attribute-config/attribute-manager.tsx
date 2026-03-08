"use client";

import { useState, useRef } from 'react';
import { useEntityStore } from '@/lib/entityStore';
import { useBioStore } from '@/lib/store/bioStore';
import { GameAttribute, GameAttributeCategory } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, Check, X, Search, Download, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AttributeManager() {
    const {
        gameAttributeCategories,
        gameAttributes,
        addGameAttribute,
        updateGameAttribute,
        deleteGameAttribute
    } = useEntityStore();
    const { symbolicMappings, getAllData } = useBioStore();
    const data = getAllData();

    // Flatten all potentially mappable nodes
    const allNodes = [
        ...data.childhood,
        ...data.formative,
        ...data.professional,
        ...(data.senior || [])
    ];

    const getMappedNodeLabel = (categoryId: string, entityId: string) => {
        const mapping = (symbolicMappings || []).find(
            m => m.category === categoryId && m.key === entityId
        );
        if (!mapping) return <span className="text-muted-foreground/50 italic">Unmapped</span>;

        const node = allNodes.find(n => n.id === mapping.nodeId);
        if (!node) return <span className="text-red-500 text-xs">Invalid mapping (node deleted)</span>;

        return <span className="text-xs font-mono">[{node.slot}] {node.text.substring(0, 30)}...</span>;
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const exportData = {
            gameAttributeCategories,
            gameAttributes
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'parley-attributes.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                if (importedData.gameAttributeCategories && importedData.gameAttributes) {
                    const importedCategories = importedData.gameAttributeCategories as GameAttributeCategory[];
                    const importedAttributes = importedData.gameAttributes as GameAttribute[];

                    useEntityStore.setState((prev) => {
                        const newCategories = [...(prev.gameAttributeCategories || [])];
                        importedCategories.forEach(ic => {
                            const existingIndex = newCategories.findIndex(c => c.id === ic.id);
                            if (existingIndex >= 0) {
                                newCategories[existingIndex] = ic;
                            } else {
                                newCategories.push(ic);
                            }
                        });

                        const newAttributes = [...(prev.gameAttributes || [])];
                        importedAttributes.forEach(ia => {
                            const existingIndex = newAttributes.findIndex(a => a.id === ia.id);
                            if (existingIndex >= 0) {
                                newAttributes[existingIndex] = ia;
                            } else {
                                newAttributes.push(ia);
                            }
                        });

                        return {
                            gameAttributeCategories: newCategories,
                            gameAttributes: newAttributes
                        };
                    });
                } else {
                    alert("Invalid file format. Ensure the file contains both categories and attributes.");
                }
            } catch (err) {
                console.error("Failed to parse imported attributes", err);
                alert("Failed to import attributes. Invalid JSON file format.");
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editRelatedCount, setEditRelatedCount] = useState<number>(0);
    const [editShareLastName, setEditShareLastName] = useState<boolean>(false);

    // State for creating new attributes
    const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newRelatedCount, setNewRelatedCount] = useState<number>(0);
    const [newShareLastName, setNewShareLastName] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<string>(gameAttributeCategories?.[0]?.id || "");
    const [search, setSearch] = useState("");

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSearch(""); // Reset search on tab change
        handleEditCancel();
        handleCreateCancel();
    };

    const handleEditStart = (attr: GameAttribute) => {
        setEditingId(attr.id);
        setEditName(attr.name);
        setEditDesc(attr.description || "");
        setEditRelatedCount(attr.relatedCharacterCount || 0);
        setEditShareLastName(attr.shareLastName || false);
        setNewItemCategory(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName("");
        setEditDesc("");
        setEditRelatedCount(0);
        setEditShareLastName(false);
    };

    const handleEditSave = (attr: GameAttribute) => {
        if (!editName.trim()) return;
        updateGameAttribute({
            ...attr,
            name: editName,
            description: editDesc,
            relatedCharacterCount: editRelatedCount,
            shareLastName: editShareLastName,
        });
        handleEditCancel();
    };

    const handleCreateStart = (categoryId: string) => {
        setNewItemCategory(categoryId);
        setNewName("");
        setNewDesc("");
        setNewRelatedCount(0);
        setNewShareLastName(false);
        setEditingId(null);
    };

    const handleCreateCancel = () => {
        setNewItemCategory(null);
        setNewName("");
        setNewDesc("");
        setNewRelatedCount(0);
        setNewShareLastName(false);
    };

    const handleCreateSave = (categoryId: string) => {
        if (!newName.trim()) return;

        const newAttr: GameAttribute = {
            id: uuidv4(),
            categoryId,
            name: newName,
            description: newDesc,
            relatedCharacterCount: newRelatedCount,
            shareLastName: newShareLastName,
        };

        addGameAttribute(newAttr);
        handleCreateCancel();
    };

    if (!gameAttributeCategories || gameAttributeCategories.length === 0) {
        return null; // Ensure we have categories hydrated
    }

    // Default to the first category if not set on load
    const currentTabId = activeTab || gameAttributeCategories[0].id;

    return (
        <div className="space-y-6">
            <Tabs value={currentTabId} onValueChange={handleTabChange} className="w-full space-y-4">
                <TabsList>
                    {gameAttributeCategories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                            {category.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {gameAttributeCategories.map((category) => {
                    const categoryAttributes = (gameAttributes || []).filter(a => a.categoryId === category.id);
                    const filteredAttributes = categoryAttributes.filter(a =>
                        a.name.toLowerCase().includes(search.toLowerCase()) ||
                        (a.description && a.description.toLowerCase().includes(search.toLowerCase()))
                    );

                    return (
                        <TabsContent key={category.id} value={category.id} className="mt-0 space-y-4">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative max-w-sm">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={`Search ${category.name.toLowerCase()}...`}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-8 w-[300px]"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept=".json"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleImportFile}
                                    />
                                    <Button variant="outline" onClick={handleImportClick}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import
                                    </Button>
                                    <Button variant="outline" onClick={handleExport}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                    <Button onClick={() => handleCreateStart(category.id)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New {category.name}
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[20%]">Name</TableHead>
                                            <TableHead className="w-[30%]">Description</TableHead>
                                            <TableHead className="w-[15%]">Placeholders</TableHead>
                                            <TableHead>Bio Node Mapping</TableHead>
                                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAttributes.length === 0 && newItemCategory !== category.id && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                    No attributes found for {category.name}.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {filteredAttributes.map((attr) => (
                                            <TableRow key={attr.id}>
                                                {editingId === attr.id ? (
                                                    <>
                                                        <TableCell className="align-top py-4">
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                placeholder="Name"
                                                                autoFocus
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <Input
                                                                value={editDesc}
                                                                onChange={(e) => setEditDesc(e.target.value)}
                                                                placeholder="Description"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <div className="flex flex-col gap-2">
                                                                <Input
                                                                    type="number"
                                                                    value={editRelatedCount}
                                                                    onChange={(e) => setEditRelatedCount(parseInt(e.target.value) || 0)}
                                                                    placeholder="Count"
                                                                    className="h-8 text-xs w-20"
                                                                    min={0}
                                                                />
                                                                <label className="flex items-center gap-2 text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editShareLastName}
                                                                        onChange={(e) => setEditShareLastName(e.target.checked)}
                                                                    />
                                                                    Share Last Name
                                                                </label>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            {getMappedNodeLabel(category.id, attr.id)}
                                                        </TableCell>
                                                        <TableCell className="text-right align-top py-4">
                                                            <div className="flex justify-end gap-1">
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
                                                        <TableCell className="text-muted-foreground text-sm align-middle max-w-[400px]">
                                                            {attr.description}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-xs align-middle whitespace-pre-wrap">
                                                            {attr.relatedCharacterCount ? `Count: ${attr.relatedCharacterCount}\nShare LN: ${attr.shareLastName ? 'Yes' : 'No'}` : '-'}
                                                        </TableCell>
                                                        <TableCell className="align-middle">
                                                            {getMappedNodeLabel(category.id, attr.id)}
                                                        </TableCell>
                                                        <TableCell className="text-right align-middle">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditStart(attr)}>
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteGameAttribute(attr.id)}>
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
                                                <TableCell className="align-top py-4">
                                                    <Input
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        placeholder="New Item Name"
                                                        autoFocus
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top py-4">
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
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Input
                                                            type="number"
                                                            value={newRelatedCount}
                                                            onChange={(e) => setNewRelatedCount(parseInt(e.target.value) || 0)}
                                                            placeholder="Count"
                                                            className="h-8 text-xs w-20"
                                                            min={0}
                                                        />
                                                        <label className="flex items-center gap-2 text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden">
                                                            <input
                                                                type="checkbox"
                                                                checked={newShareLastName}
                                                                onChange={(e) => setNewShareLastName(e.target.checked)}
                                                            />
                                                            Share Last Name
                                                        </label>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4 text-muted-foreground/50 italic text-xs">
                                                    Will be unmapped initially
                                                </TableCell>
                                                <TableCell className="text-right align-top py-4">
                                                    <div className="flex justify-end gap-1">
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
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
