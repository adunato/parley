"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BioDatasetEditor } from "@/components/bio-config/bio-dataset-editor";
import { BioGraphView } from "@/components/bio-config/bio-graph-view";
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
                    <TabsTrigger value="origins">Origins</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="careers">Careers</TabsTrigger>
                    <TabsTrigger value="events">Life Events</TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">Dependency Graph</h2>
                        <p className="text-sm text-muted-foreground">Visualizes the flow from Origins to Careers based on tag requirements.</p>
                    </div>
                    <BioGraphView />
                </TabsContent>

                <TabsContent value="origins" className="space-y-4">
                    <BioDatasetEditor
                        title="Origins"
                        description="Starting socioeconomic and geographic backgrounds."
                        data={store.origins}
                        type="ORIGIN"
                        onAdd={store.addOrigin}
                        onUpdate={store.updateOrigin}
                        onDelete={store.deleteOrigin}
                    />
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                    <BioDatasetEditor
                        title="Education"
                        description="Academic and vocational history."
                        data={store.education}
                        type="EDUCATION"
                        onAdd={store.addEducation}
                        onUpdate={store.updateEducation}
                        onDelete={store.deleteEducation}
                    />
                </TabsContent>

                <TabsContent value="careers" className="space-y-4">
                    <BioDatasetEditor
                        title="Careers"
                        description="Professional roles and occupations."
                        data={store.careers}
                        type="CAREER"
                        onAdd={store.addCareer}
                        onUpdate={store.updateCareer}
                        onDelete={store.deleteCareer}
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
            </Tabs>
        </div>
    );
}
