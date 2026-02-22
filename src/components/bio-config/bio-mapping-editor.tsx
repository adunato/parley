import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Save, X } from "lucide-react";
import { useBioStore } from "@/lib/store/bioStore";
import { useEntityStore } from "@/lib/entityStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EventNode, SymbolicMapping } from '@/lib/generator/types';

export function BioMappingEditor() {
    const { symbolicMappings, addSymbolicMapping, updateSymbolicMapping, deleteSymbolicMapping, getAllData, getAllMappableEntities } = useBioStore();
    const { gameAttributeCategories } = useEntityStore();
    const data = getAllData();
    const mappableEntities = getAllMappableEntities();

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

    // Compute available categories dynamically based on defined entities
    const activeCategoryIds = Array.from(new Set(mappableEntities.map(e => e.categoryId)));
    const categoryOptions = activeCategoryIds.map(id => {
        if (id === 'profession') return { id: 'profession', name: 'Profession' };
        const found = gameAttributeCategories?.find(c => c.id === id);
        return { id, name: found ? found.name : id };
    });

    // Entities available for the selected category
    const entitiesForCategory = mappableEntities.filter(e => e.categoryId === newCategory);

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

    const getEntityNameByKey = (categoryId: string, key: string) => {
        const entity = mappableEntities.find(e => e.categoryId === categoryId && e.id === key);
        return entity ? entity.name : key;
    };

    const getCategoryName = (categoryId: string) => {
        if (categoryId === 'profession') return 'Profession';
        const found = gameAttributeCategories?.find(c => c.id === categoryId);
        return found ? found.name : categoryId;
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
                                {categoryOptions.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
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
                                {entitiesForCategory.map(entity => {
                                    const isAlreadyMapped = (symbolicMappings || []).some(
                                        m => m.category === newCategory && m.key === entity.id
                                    );
                                    return (
                                        <SelectItem key={entity.id} value={entity.id} disabled={isAlreadyMapped}>
                                            {entity.name} {isAlreadyMapped && "(Mapped)"}
                                        </SelectItem>
                                    );
                                })}
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
                                    .map(node => {
                                        const isNodeMapped = (symbolicMappings || []).some(m => m.nodeId === node.id);
                                        return (
                                            <SelectItem key={node.id} value={node.id} disabled={isNodeMapped}>
                                                <span className="font-mono text-xs mr-2">[{node.slot}]</span>
                                                {node.text.substring(0, 40)}... {isNodeMapped && "(Mapped)"}
                                            </SelectItem>
                                        );
                                    })}
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
                            <span>{getCategoryName(category)}</span>
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
                                        <TableCell className="font-medium">{getEntityNameByKey(category, mapping.key)}</TableCell>
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
