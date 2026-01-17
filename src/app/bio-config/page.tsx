"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioDatasetEditor } from "@/components/bio-config/bio-dataset-editor";
import { TagDatasetEditor } from "@/components/bio-config/tag-dataset-editor";
import { BioGraphView } from "@/components/bio-config/bio-graph-view";
import { BioPhaseSettings } from "@/components/bio-config/bio-phase-settings";
import { BioDatasetManager } from "@/components/bio-config/bio-dataset-manager";

import { useBioStore } from "@/lib/store/bioStore";
import { useBioLibraryStore } from "@/lib/store/bioLibraryStore";
import { BioDatasetService } from "@/lib/services/bioDatasetService";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function BioConfigPage() {
    const store = useBioStore();
    const { datasets, setCurrentDatasetId } = useBioLibraryStore();
    const [isMigrating, setIsMigrating] = useState(false);

    // UI State for specific exports
    const settingsFileInputRef = useRef<HTMLInputElement>(null);
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showFeedback = (message: string, type: 'success' | 'error') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleExportSettings = () => {
        const data = store.phaseConfig;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `parley-bio-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showFeedback("Settings exported successfully", "success");
    };

    const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Basic validation: check for keys like 'Childhood', 'Formative'
                if (!json.Childhood || !json.Formative) {
                    throw new Error("Invalid settings file format");
                }

                store.setPhaseConfig(json);
                showFeedback("Generation settings imported successfully", "success");
            } catch (error) {
                console.error("Import failed:", error);
                showFeedback("Failed to import settings. Invalid JSON format.", "error");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (settingsFileInputRef.current) settingsFileInputRef.current.value = "";
    };

    // Initial Migration / Setup
    useEffect(() => {
        const init = async () => {
            // Wait for store hydration
            if (!store._hasHydrated) return;

            // If we have no datasets but we have data in the store (which we always do due to hydration/default),
            // we should wrap it in a "Default Dataset" if it's the first run with this new system.
            // Or if datasets length is 0.
            if (datasets.length === 0 && !isMigrating) {
                setIsMigrating(true);
                try {
                    console.log("Initializing Bio Dataset System...");
                    const id = crypto.randomUUID();
                    // We can use the service to "save" current state as a new dataset.
                    // But service.saveDataset requires ID to exist in library.
                    // So we manually construct it here or add a helper in Service.
                    // Let's manually do it to ensure we capture current store state.

                    await BioDatasetService.createNewDataset("Default World");
                    // createNewDataset clears the store to empty.
                    // BUT we wanted to preserve the existing data!
                    // Ah, `createNewDataset` logic was: Add to Library -> Clear Store -> Set Current.
                    // That's bad for migration.

                    // Let's implement migration logic here specifically.

                    // 1. Create Metadata
                    const defaultDataset = {
                        id,
                        name: "Default World",
                        lastModified: Date.now()
                    };
                    useBioLibraryStore.getState().addDataset(defaultDataset);
                    useBioLibraryStore.getState().setCurrentDatasetId(id);

                    // 2. Save current store content to this ID
                    await BioDatasetService.saveDataset(id);

                    console.log("Created Default World dataset from existing data.");
                } catch (e) {
                    console.error("Failed to initialize default dataset", e);
                } finally {
                    setIsMigrating(false);
                }
            }
        };

        init();
    }, [store._hasHydrated, datasets.length]);


    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bio Generator Configuration</h1>
                    <p className="text-muted-foreground">
                        Manage the datasets used for procedural character generation (The World Bible).
                    </p>
                </div>

                {/* Dataset Manager */}
                <BioDatasetManager />
            </div>

            <Tabs defaultValue="graph" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="graph">Graph View</TabsTrigger>
                    <TabsTrigger value="childhood">Childhood</TabsTrigger>
                    <TabsTrigger value="formative">Formative</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="senior">Senior</TabsTrigger>
                    <TabsTrigger value="events">Life Events</TabsTrigger>
                    <TabsTrigger value="tags">Tags</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">Dependency Graph</h2>
                        <p className="text-sm text-muted-foreground">Visualizes the flow from Childhood to Professional based on tag requirements.</p>
                    </div>
                    <BioGraphView />
                </TabsContent>

                <TabsContent value="childhood" className="space-y-4">
                    <BioDatasetEditor
                        title="Childhood"
                        description="Starting socioeconomic and geographic backgrounds."
                        data={store.childhood}
                        type="CHILDHOOD"
                        phase="Childhood"
                        onAdd={store.addChildhood}
                        onUpdate={store.updateChildhood}
                        onDelete={store.deleteChildhood}
                    />
                </TabsContent>

                <TabsContent value="formative" className="space-y-4">
                    <BioDatasetEditor
                        title="Formative"
                        description="Academic and vocational history."
                        data={store.formative}
                        type="FORMATIVE"
                        phase="Formative"
                        onAdd={store.addFormative}
                        onUpdate={store.updateFormative}
                        onDelete={store.deleteFormative}
                    />
                </TabsContent>

                <TabsContent value="professional" className="space-y-4">
                    <BioDatasetEditor
                        title="Professional"
                        description="Professional roles and occupations."
                        data={store.professional}
                        type="PROFESSIONAL"
                        phase="Professional"
                        onAdd={store.addProfessional}
                        onUpdate={store.updateProfessional}
                        onDelete={store.deleteProfessional}
                    />
                </TabsContent>

                <TabsContent value="senior" className="space-y-4">
                    <BioDatasetEditor
                        title="Senior"
                        description="Retirement status or late-life role."
                        data={store.senior}
                        type="SENIOR"
                        phase="Senior"
                        onAdd={store.addSenior}
                        onUpdate={store.updateSenior}
                        onDelete={store.deleteSenior}
                    />
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                    <BioDatasetEditor
                        title="Life Events"
                        description="Simulated events that add texture for the 'Flesh' layer."
                        data={store.lifeEvents}
                        type="LIFE_EVENT"
                        onAdd={store.addLifeEvent}
                        onUpdate={store.updateLifeEvent}
                        onDelete={store.deleteLifeEvent}
                    />
                </TabsContent>

                <TabsContent value="tags" className="space-y-4">
                    <TagDatasetEditor
                        tags={store.tags}
                        bioData={store.getAllData()}
                        onAdd={store.addTag}
                        onUpdate={store.updateTag}
                        onDelete={store.deleteTag}
                    />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">Generation Settings</h2>
                        <p className="text-sm text-muted-foreground">Adjust age boundaries, simulation intervals, and event probabilities for each phase.</p>
                    </div>
                    <BioPhaseSettings />

                    <div className="pt-6 border-t">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Data Management</h3>
                                {feedback && (
                                    <div className={`text-sm px-3 py-1 rounded-full ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {feedback.message}
                                    </div>
                                )}
                            </div>
                            <div className="max-w-md">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Generation Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Export or Import the simulation configuration (Ages, Chances).
                                            <br />
                                            <span className="text-xs text-amber-600 dark:text-amber-400">Warning: Importing will overwrite current settings.</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleExportSettings}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export Settings
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => settingsFileInputRef.current?.click()}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Import Settings
                                        </Button>
                                        <input
                                            type="file"
                                            ref={settingsFileInputRef}
                                            className="hidden"
                                            accept=".json"
                                            onChange={handleImportSettings}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}