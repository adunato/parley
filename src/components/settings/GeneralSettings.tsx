"use client";

import { useParleyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { SettingsManager } from "./SettingsManager";

interface Model {
    id: string;
    name: string;
    provider: string;
}

interface GeneralSettingsProps {
    models: Model[];
}

export function GeneralSettings({ models }: GeneralSettingsProps) {
    const {
        chatModel, setChatModel,
        summarizationModel, setSummarizationModel,
        generationModel, setGenerationModel,
    } = useParleyStore();

    return (
        <div className="space-y-8 pt-4">
            <section>
                <h2 className="text-xl font-semibold mb-2">Chat Model</h2>
                <Label htmlFor="chat-model-select" className="sr-only">Chat Model</Label>
                <Combobox<Model>
                    items={models}
                    value={chatModel}
                    onValueChange={setChatModel}
                    placeholder="Select a chat model..."
                    filterFn={(item, query) =>
                        item.id.toLowerCase().includes(query.toLowerCase())
                    }
                    itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Summarization Model</h2>
                <Label htmlFor="summarization-model-select" className="sr-only">Summarization Model</Label>
                <Combobox<Model>
                    items={models}
                    value={summarizationModel}
                    onValueChange={setSummarizationModel}
                    placeholder="Select a summarization model..."
                    filterFn={(item, query) =>
                        item.id.toLowerCase().includes(query.toLowerCase())
                    }
                    itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Generation Model</h2>
                <Label htmlFor="generation-model-select" className="sr-only">Generation Model</Label>
                <Combobox<Model>
                    items={models}
                    value={generationModel}
                    onValueChange={setGenerationModel}
                    placeholder="Select a generation model..."
                    filterFn={(item, query) =>
                        item.id.toLowerCase().includes(query.toLowerCase())
                    }
                    itemToString={(item) => item.provider ? `${item.id} - ${item.name} (${item.provider})` : `${item.id} - ${item.name}`}
                />
            </section>

            <section className="pt-4 border-t">
                <h2 className="text-xl font-semibold mb-2">Data Management</h2>
                <div className="flex gap-4">
                    <SettingsManager />
                </div>
            </section>
        </div>
    );
}
