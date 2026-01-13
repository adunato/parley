"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioDatasetEditor } from "@/components/bio-config/bio-dataset-editor";
import { TagDatasetEditor } from "@/components/bio-config/tag-dataset-editor";
import { BioGraphView } from "@/components/bio-config/bio-graph-view";
import { BioPhaseSettings } from "@/components/bio-config/bio-phase-settings";
import { useBioStore } from "@/lib/store/bioStore";

export default function BioConfigPage() {
    const store = useBioStore();

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
                        <p className="text-sm text-muted-foreground">Visualizes the flow from Origins to Careers based on tag requirements.</p>
                    </div>
                    <BioGraphView />
                </TabsContent>

                <TabsContent value="childhood" className="space-y-4">
                    <BioDatasetEditor
                        title="Childhood (Origins)"
                        description="Starting socioeconomic and geographic backgrounds."
                        data={store.origins}
                        type="ORIGIN"
                        phase="Childhood"
                        onAdd={store.addOrigin}
                        onUpdate={store.updateOrigin}
                        onDelete={store.deleteOrigin}
                    />
                </TabsContent>

                <TabsContent value="formative" className="space-y-4">
                    <BioDatasetEditor
                        title="Formative (Education)"
                        description="Academic and vocational history."
                        data={store.education}
                        type="EDUCATION"
                        phase="Formative"
                        onAdd={store.addEducation}
                        onUpdate={store.updateEducation}
                        onDelete={store.deleteEducation}
                    />
                </TabsContent>

                <TabsContent value="professional" className="space-y-4">
                    <BioDatasetEditor
                        title="Professional (Careers)"
                        description="Professional roles and occupations."
                        data={store.careers}
                        type="CAREER"
                        phase="Professional"
                        onAdd={store.addCareer}
                        onUpdate={store.updateCareer}
                        onDelete={store.deleteCareer}
                    />
                </TabsContent>

                <TabsContent value="senior" className="space-y-4">
                    <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                        <h3 className="text-lg font-medium">Senior Phase</h3>
                        <p>This phase currently has no associated Spine nodes (it focus on Life Events).</p>
                    </div>
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
