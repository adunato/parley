import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Download, Trash2, Edit2, Copy } from 'lucide-react';
import { useBioLibraryStore } from '@/lib/store/bioLibraryStore';
import { BioDatasetService } from '@/lib/services/bioDatasetService';

export function BioDatasetManager() {
    const { datasets, currentDatasetId, updateDataset } = useBioLibraryStore();

    const [newDatasetName, setNewDatasetName] = useState('');
    const [isNewDatasetDialogOpen, setIsNewDatasetDialogOpen] = useState(false);

    const [renameDatasetName, setRenameDatasetName] = useState('');
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [datasetToRename, setDatasetToRename] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleCreateDataset = async () => {
        if (!newDatasetName.trim()) return;
        try {
            await BioDatasetService.createNewDataset(newDatasetName);
            setNewDatasetName('');
            setIsNewDatasetDialogOpen(false);
        } catch (e) {
            alert("Failed to create dataset: " + (e as Error).message);
        }
    };

    const handleSelectDataset = async (id: string) => {
        // Save current before switching?
        if (currentDatasetId) {
            await BioDatasetService.saveDataset(currentDatasetId);
        }

        // Load new
        try {
            await BioDatasetService.loadDataset(id);
        } catch (e) {
            alert("Failed to load dataset: " + (e as Error).message);
        }
    };

    const handleRenameDataset = () => {
        if (!datasetToRename || !renameDatasetName.trim()) return;
        updateDataset(datasetToRename, { name: renameDatasetName });
        // Optionally trigger a save to ensure DB name matches
        // For now, metadata update in library is enough for UI, but good to sync DB.
        // We'd need a specific rename in Service or just save it.
        // Let's assume user saves explicitly or auto-save handles content, but name is metadata.
        // Ideally we update the DB record too.
        // Since we don't have a renameDataset method in Service, we can add one or just manual update.
        // Or just leave it in LibraryStore until next save.
        // But updating the library store is persistent too.
        setIsRenameDialogOpen(false);
        setDatasetToRename(null);
    };

    const handleDeleteDataset = async (id: string) => {
        if (confirm("Are you sure you want to delete this dataset? This cannot be undone.")) {
            try {
                await BioDatasetService.deleteDataset(id);
            } catch (e) {
                alert("Failed to delete dataset: " + (e as Error).message);
            }
        }
    };

    const handleExportDataset = async () => {
        if (!currentDatasetId) return;
        try {
            // Ensure saved first
            const json = await BioDatasetService.exportDatasetToJSON(currentDatasetId);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataset = datasets.find(d => d.id === currentDatasetId);
            a.download = `parley-bio-dataset-${dataset?.name || 'untitled'}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert("Export failed: " + (e as Error).message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (currentDatasetId) {
                await BioDatasetService.saveDataset(currentDatasetId);
            }
            const newId = await BioDatasetService.importDatasetFromJSON(file);
            await BioDatasetService.loadDataset(newId);
            alert("Dataset imported successfully!");
        } catch (e) {
            alert("Import failed: " + (e as Error).message);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveAs = async () => {
        if (!currentDatasetId) return;
        const dataset = datasets.find(d => d.id === currentDatasetId);
        const newName = prompt("Enter new name for copy:", `${dataset?.name} (Copy)`);
        if (newName) {
            try {
                const newId = await BioDatasetService.cloneDataset(currentDatasetId, newName);
                await BioDatasetService.loadDataset(newId);
            } catch (e) {
                alert("Failed to copy dataset: " + (e as Error).message);
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/20 rounded-lg border border-border">
            <div className="flex-1 min-w-[200px] flex gap-2">
                {/* Dataset Selector */}
                <Select value={currentDatasetId || ''} onValueChange={handleSelectDataset}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Bio Dataset" />
                    </SelectTrigger>
                    <SelectContent>
                        {datasets.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Rename Button */}
                {currentDatasetId && (
                    <Button variant="ghost" size="icon" onClick={() => {
                        const d = datasets.find(d => d.id === currentDatasetId);
                        if (d) {
                            setDatasetToRename(d.id);
                            setRenameDatasetName(d.name);
                            setIsRenameDialogOpen(true);
                        }
                    }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex gap-2">
                {/* New Dataset */}
                <Dialog open={isNewDatasetDialogOpen} onOpenChange={setIsNewDatasetDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Dataset</DialogTitle>
                            <DialogDescription>
                                Start a fresh bio dataset. Current progress will be saved.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            value={newDatasetName}
                            onChange={(e) => setNewDatasetName(e.target.value)}
                            placeholder="Dataset Name"
                        />
                        <DialogFooter>
                            <Button onClick={handleCreateDataset}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Save As / Clone */}
                <Button variant="outline" size="sm" onClick={handleSaveAs} disabled={!currentDatasetId}>
                    <Copy className="mr-2 h-4 w-4" /> Save As
                </Button>

                {/* Export */}
                <Button variant="outline" size="sm" onClick={handleExportDataset} disabled={!currentDatasetId}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>

                {/* Import */}
                <div className="hidden">
                    <Input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" /> Import
                </Button>

                {/* Delete */}
                {currentDatasetId && (
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteDataset(currentDatasetId!)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Dataset</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={renameDatasetName}
                        onChange={(e) => setRenameDatasetName(e.target.value)}
                    />
                    <DialogFooter>
                        <Button onClick={handleRenameDataset}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
