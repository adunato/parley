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
import { useEffect, useState } from "react";


export default function BioConfigPage() {
    const store = useBioStore();
    const { datasets, setCurrentDatasetId } = useBioLibraryStore();
    const [isMigrating, setIsMigrating] = useState(false);

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
                </TabsContent>
            </Tabs>
        </div>
    );
}