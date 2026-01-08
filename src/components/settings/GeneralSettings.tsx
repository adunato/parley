"use client";

import { useParleyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
        theme, setTheme
    } = useParleyStore();

    return (
        <div className="space-y-8 pt-6">
            <section className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Appearance</h2>
                </div>
                <Label htmlFor="theme-select" className="sr-only">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme-select" className="w-full">
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="demiplane-light">Demiplane Light (Parchment)</SelectItem>
                        <SelectItem value="demiplane-dark">Demiplane Dark (Void)</SelectItem>
                    </SelectContent>
                </Select>
            </section>

            <section className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Chat Model</h2>
                </div>
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

            <section className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Summarization Model</h2>
                </div>
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

            <section className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Generation Model</h2>
                </div>
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

            <section className="pt-8 border-t border-border space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Data Management</h2>
                <div className="flex gap-4">
                    <SettingsManager />
                </div>
            </section>
        </div>
    );
}
