import { useState, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Download, Upload } from "lucide-react";
import { Profession } from "@/lib/types";
import { useBioStore } from "@/lib/store/bioStore";
import { ProfessionModal } from "./profession-modal";

interface ProfessionListProps {
    data: Profession[];
    onAdd: (item: Profession) => void;
    onUpdate: (item: Profession) => void;
    onDelete: (id: string) => void;
}

export function ProfessionList({ data, onAdd, onUpdate, onDelete }: ProfessionListProps) {
    const { symbolicMappings, getAllData } = useBioStore();
    const bioData = getAllData();

    // Flatten all potentially mappable nodes
    const allNodes = [
        ...bioData.childhood,
        ...bioData.formative,
        ...bioData.professional,
        ...(bioData.senior || [])
    ];

    const getMappedNodeLabel = (categoryId: string, entityId: string) => {
        const mapping = (symbolicMappings || []).find(
            m => m.category === categoryId && m.key === entityId
        );
        if (!mapping) return <span className="text-muted-foreground/50 italic text-xs">Unmapped</span>;

        const node = allNodes.find(n => n.id === mapping.nodeId);
        if (!node) return <span className="text-red-500 text-xs">Invalid mapping (node deleted)</span>;

        return <span className="text-xs font-mono">[{node.slot}] {node.text.substring(0, 30)}...</span>;
    };

    const [search, setSearch] = useState("");
    const [editingItem, setEditingItem] = useState<Profession | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'parley-professions.json';

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
                const importedData = JSON.parse(e.target?.result as string) as Profession[];
                if (Array.isArray(importedData)) {
                    importedData.forEach(importedItem => {
                        const exists = data.find(i => i.id === importedItem.id);
                        if (exists) {
                            onUpdate(importedItem);
                        } else {
                            onAdd(importedItem);
                        }
                    });
                } else {
                    alert("Invalid file format. Expected an array of professions.");
                }
            } catch (err) {
                console.error("Failed to parse imported professions", err);
                alert("Failed to import professions. Invalid JSON file format.");
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    };

    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (item: Profession) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (item: Profession) => {
        if (editingItem && editingItem.id !== item.id) {
            // ID changed (Rename)
            // Since store update relies on ID, we must Delete Old and Add New.
            onDelete(editingItem.id);
            onAdd(item);
        } else if (editingItem) {
            // Regular Update
            onUpdate(item);
        } else {
            // Create
            onAdd(item);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search professions..."
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
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Profession
                    </Button>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">ID</TableHead>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px] text-center">Min Age</TableHead>
                            <TableHead className="w-[100px] text-center">Max Age</TableHead>
                            <TableHead>Bio Node Mapping</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No professions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm truncate max-w-[400px]" title={item.description}>
                                        {item.description}
                                    </TableCell>
                                    <TableCell className="text-center">{item.minAge}</TableCell>
                                    <TableCell className="text-center">{item.maxAge}</TableCell>
                                    <TableCell>{getMappedNodeLabel('profession', item.id)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => onDelete(item.id)}
                                            >
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

            <ProfessionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={editingItem}
                onSave={handleSave}
                existingIds={data.map((i) => i.id)}
            />
        </div>
    );
}
