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
import { Plus, Save, Upload, Download, Trash2, Edit2, Copy } from 'lucide-react';
import { useProjectLibraryStore, ProjectMetadata } from '@/lib/store/projectStore';
import { ProjectService } from '@/lib/services/projectService';

export function ProjectManager() {
    const { projects, currentProjectId, deleteProject, updateProject, setCurrentProjectId } = useProjectLibraryStore();

    const [newProjectName, setNewProjectName] = useState('');
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

    const [renameProjectName, setRenameProjectName] = useState('');
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;
        ProjectService.createNewProject(newProjectName);
        setNewProjectName('');
        setIsNewProjectDialogOpen(false);
    };

    const handleSelectProject = (id: string) => {
        // Save current before switching? 
        // Ideally we save on every change or debounced, but let's ensure we save current state before unloading it.
        if (currentProjectId) {
            ProjectService.saveProject(currentProjectId);
        }

        // Load new
        try {
            ProjectService.loadProject(id);
        } catch (e) {
            alert("Failed to load project: " + (e as Error).message);
        }
    };

    const handleRenameProject = () => {
        if (!projectToRename || !renameProjectName.trim()) return;
        updateProject(projectToRename, { name: renameProjectName });
        setIsRenameDialogOpen(false);
        setProjectToRename(null);
    };

    const handleDeleteProject = (id: string) => {
        if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
            ProjectService.deleteProject(id);
            if (currentProjectId === id) {
                // If we deleted the active project, clear the store
                // Or switch to another one?
                // Let's just reload the page or clear stores.
                // ProjectService.createNewProject("New World"); // Auto create?
            }
        }
    };

    const handleExportProject = () => {
        if (!currentProjectId) return;
        try {
            const json = ProjectService.exportProjectToJSON(currentProjectId);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const project = projects.find(p => p.id === currentProjectId);
            a.download = `parley-project-${project?.name || 'untitled'}-${Date.now()}.json`;
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
            if (currentProjectId) {
                ProjectService.saveProject(currentProjectId);
            }
            const newId = await ProjectService.importProjectFromJSON(file);
            ProjectService.loadProject(newId);
            alert("Project imported successfully!");
        } catch (e) {
            alert("Import failed: " + (e as Error).message);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveAsClient = () => {
        if (!currentProjectId) return;
        const project = projects.find(p => p.id === currentProjectId);
        const newName = prompt("Enter new name for copy:", `${project?.name} (Copy)`);
        if (newName) {
            // Save current state first
            ProjectService.saveProject(currentProjectId);

            // Just creating a new project from current state is effectively 'Save As'
            // But ProjectService.createNewProject clears state.
            // We need a clone logic. 
            // Workaround: Export then Import? Or direct clone standard function.
            // Let's implement a 'clone' helper here quickly or update service.
            // Updating service is cleaner but for now let's just:
            const json = ProjectService.exportProjectToJSON(currentProjectId);
            // Parse it back as if importing, but change name
            // Actually 'importProject' does generate new ID.
            // So we can mock a file or just duplicate the logic.
            const data = JSON.parse(json);
            data.metadata.name = newName;

            // Manually injecting into storage
            const newId = crypto.randomUUID();
            localStorage.setItem(`parley_project_${newId}`, JSON.stringify(data));
            useProjectLibraryStore.getState().addProject({
                id: newId,
                name: newName,
                description: data.metadata.description,
                lastModified: Date.now()
            });
            ProjectService.loadProject(newId);
        }
    };


    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/20 rounded-lg mb-6 border border-border">
            <div className="flex-1 min-w-[200px] flex gap-2">
                {/* Project Selector */}
                <Select value={currentProjectId || ''} onValueChange={handleSelectProject}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a World Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Rename Button */}
                {currentProjectId && (
                    <Button variant="ghost" size="icon" onClick={() => {
                        const p = projects.find(p => p.id === currentProjectId);
                        if (p) {
                            setProjectToRename(p.id);
                            setRenameProjectName(p.name);
                            setIsRenameDialogOpen(true);
                        }
                    }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex gap-2">

                {/* New Project */}
                <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Start a fresh world. Current progress will be saved.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="Project Name"
                        />
                        <DialogFooter>
                            <Button onClick={handleCreateProject}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Save As / Clone */}
                <Button variant="outline" size="sm" onClick={handleSaveAsClient} disabled={!currentProjectId}>
                    <Copy className="mr-2 h-4 w-4" /> Save As
                </Button>

                {/* Export */}
                <Button variant="outline" size="sm" onClick={handleExportProject} disabled={!currentProjectId}>
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
                {currentProjectId && (
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteProject(currentProjectId!)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Project</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={renameProjectName}
                        onChange={(e) => setRenameProjectName(e.target.value)}
                    />
                    <DialogFooter>
                        <Button onClick={handleRenameProject}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
