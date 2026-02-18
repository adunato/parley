import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Save, X } from "lucide-react";
import { useBioStore } from "@/lib/store/bioStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EventNode, SymbolicMapping } from '@/lib/generator/types';

export function BioMappingEditor() {
    const { symbolicMappings, addSymbolicMapping, updateSymbolicMapping, deleteSymbolicMapping, getAllData } = useBioStore();
    const data = getAllData();

    // Flatten all potentially mappable nodes
    const allNodes = [
        ...data.childhood,
        ...data.formative,
        ...data.professional,
        ...(data.senior || [])
    ];

    const [newCategory, setNewCategory] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newNodeId, setNewNodeId] = useState('');

    const [editingMapping, setEditingMapping] = useState<{ category: string, key: string } | null>(null);

    // Group mappings by category
    const groupedMappings = (symbolicMappings || []).reduce((acc, mapping) => {
        if (!acc[mapping.category]) acc[mapping.category] = [];
        acc[mapping.category].push(mapping);
        return acc;
    }, {} as Record<string, SymbolicMapping[]>);

    const handleAdd = () => {
        if (!newCategory || !newKey || !newNodeId) return;

        // Check uniqueness
        if (symbolicMappings?.some(m => m.category === newCategory && m.key === newKey)) {
            alert("This mapping already exists!");
            return;
        }

        addSymbolicMapping({
            category: newCategory,
            key: newKey,
            nodeId: newNodeId
        });

        setNewKey('');
        setNewNodeId('');
    };

    const handleDelete = (category: string, key: string) => {
        if (confirm(`Delete mapping for ${category}:${key}?`)) {
            deleteSymbolicMapping(category, key);
        }
    };

    const getNodeLabel = (id: string) => {
        const node = allNodes.find(n => n.id === id);
        return node ? `${node.text.substring(0, 50)}... (${node.id})` : id;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Symbolic Mappings</h2>
                <p className="text-sm text-muted-foreground">
                    Map abstract game concepts (Roles, Origins) to specific Bio Path nodes.
                    This allows the game logic to request a "Professor" without knowing the specific node ID.
                </p>
            </div>

            {/* Add New Mapping Form */}
            <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                <h3 className="font-medium text-sm">Add New Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                    {/* Category Dropdown */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Category</label>
                        <Select
                            value={newCategory}
                            onValueChange={(val) => {
                                setNewCategory(val);
                                setNewKey(''); // Reset key when category changes
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROFESSION">Profession</SelectItem>
                                <SelectItem value="SIBLINGS">Siblings</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Key Dropdown (Dynamic) */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Key</label>
                        <Select
                            value={newKey}
                            onValueChange={setNewKey}
                            disabled={!newCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={!newCategory ? "Select Category first" : "Select Key"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {newCategory === 'PROFESSION' && data.professions.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                                {newCategory === 'SIBLINGS' && (
                                    <>
                                        <SelectItem value="No Siblings">No Siblings</SelectItem>
                                        <SelectItem value="One Sibling">One Sibling</SelectItem>
                                        <SelectItem value="Two Siblings">Two Siblings</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Node Dropdown (Filtered) */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Target Node</label>
                        <Select value={newNodeId} onValueChange={setNewNodeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a bio node..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {allNodes
                                    .map(node => (
                                        <SelectItem key={node.id} value={node.id}>
                                            <span className="font-mono text-xs mr-2">[{node.slot}]</span>
                                            {node.text.substring(0, 40)}...
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleAdd} disabled={!newCategory || !newKey || !newNodeId}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Mapping
                    </Button>
                </div>
            </div>

            {/* Mappings List */}
            <div className="space-y-6">
                {Object.entries(groupedMappings).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                        No mappings defined.
                    </div>
                )}

                {Object.entries(groupedMappings).map(([category, mappings]) => (
                    <div key={category} className="border rounded-md">
                        <div className="bg-muted/50 px-4 py-2 border-b font-medium text-sm flex justify-between items-center">
                            <span>{category}</span>
                            <Badge variant="secondary" className="text-xs">{mappings.length} items</Badge>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Key</TableHead>
                                    <TableHead>Target Node</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mappings.map(mapping => (
                                    <TableRow key={mapping.key}>
                                        <TableCell className="font-medium">{mapping.key}</TableCell>
                                        <TableCell className="text-sm">
                                            {getNodeLabel(mapping.nodeId)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDelete(category, mapping.key)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        </div>
    );
}
