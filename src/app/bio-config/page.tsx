"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioDatasetEditor } from "@/components/bio-config/bio-dataset-editor";
import { TagDatasetEditor } from "@/components/bio-config/tag-dataset-editor";
import { BioGraphView } from "@/components/bio-config/bio-graph-view";
import { BioPhaseSettings } from "@/components/bio-config/bio-phase-settings";
import { BioPhaseSettings } from "@/components/bio-config/bio-phase-settings";
import { useBioStore } from "@/lib/store/bioStore";
import { Download, Upload, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
import { toast } from "sonner";


export default function BioConfigPage() {
    const store = useBioStore();
    const worldFileInputRef = useRef<HTMLInputElement>(null);
    const settingsFileInputRef = useRef<HTMLInputElement>(null);

    const handleExportWorld = () => {
        const data = store.getAllData();
        // Exclude phaseConfig and internal flags
        const exportData = {
            ...data,
            phaseConfig: undefined,
            _hasHydrated: undefined
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `parley-bio-world-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportWorld = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Validate basic structure (optional but good practice)
                if (!json.childhood && !json.tags) {
                    throw new Error("Invalid world file format");
                }

                // Merge with existing config to preserve settings
                store.setData({
                    ...json,
                    phaseConfig: store.phaseConfig
                });
                toast.success("World data imported successfully");
            } catch (error) {
                console.error("Import failed:", error);
                toast.error("Failed to import world data. Invalid JSON format.");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (worldFileInputRef.current) worldFileInputRef.current.value = "";
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
                toast.success("Generation settings imported successfully");
            } catch (error) {
                console.error("Import failed:", error);
                toast.error("Failed to import settings. Invalid JSON format.");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (settingsFileInputRef.current) settingsFileInputRef.current.value = "";
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bio Generator Configuration</h1>
                <p className="text-muted-foreground">
                    Manage the datasets used for procedural character generation (The World Bible).
                </p>
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
                            <h3 className="text-lg font-medium">Data Management</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileJson className="w-4 h-4" />
                                            World Data
                                        </CardTitle>
                                        <CardDescription>
                                            Export or Import the world definition (Events, Tags, Groups).
                                            <br />
                                            <span className="text-xs text-amber-600 dark:text-amber-400">Warning: Importing will overwrite all current world data.</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleExportWorld}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export World
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => worldFileInputRef.current?.click()}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Import World
                                        </Button>
                                        <input
                                            type="file"
                                            ref={worldFileInputRef}
                                            className="hidden"
                                            accept=".json"
                                            onChange={handleImportWorld}
                                        />
                                    </CardContent>
                                </Card>

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