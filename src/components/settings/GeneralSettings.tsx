"use client";

import { useParleyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

interface Model {
    id: string;
    name: string;
    provider: string;
}

interface GeneralSettingsProps {
    models: Model[];
    comfyuiModels: Model[];
}

export function GeneralSettings({ models, comfyuiModels }: GeneralSettingsProps) {
    const {
        chatModel, setChatModel,
        summarizationModel, setSummarizationModel,
        generationModel, setGenerationModel,
        avatarGenerationSettings, setAvatarGenerationSettings,
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

            <section>
                <h2 className="text-xl font-semibold mb-4">Avatar Generation (ComfyUI)</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="width">Width</Label>
                            <Input
                                id="width"
                                type="number"
                                value={avatarGenerationSettings.width}
                                onChange={(e) => setAvatarGenerationSettings({ width: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <Input
                                id="height"
                                type="number"
                                value={avatarGenerationSettings.height}
                                onChange={(e) => setAvatarGenerationSettings({ height: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="steps">Steps</Label>
                            <Input
                                id="steps"
                                type="number"
                                value={avatarGenerationSettings.steps}
                                onChange={(e) => setAvatarGenerationSettings({ steps: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cfg">CFG Scale</Label>
                            <Input
                                id="cfg"
                                type="number"
                                step="0.1"
                                value={avatarGenerationSettings.cfg}
                                onChange={(e) => setAvatarGenerationSettings({ cfg: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seed">Seed (-1 for random)</Label>
                            <Input
                                id="seed"
                                type="number"
                                value={avatarGenerationSettings.seed}
                                onChange={(e) => setAvatarGenerationSettings({ seed: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="negative-prompt">Negative Prompt</Label>
                        <Textarea
                            id="negative-prompt"
                            value={avatarGenerationSettings.negativePrompt}
                            onChange={(e) => setAvatarGenerationSettings({ ...avatarGenerationSettings, negativePrompt: e.target.value })}
                            placeholder="Enter negative prompt..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Model Checkpoint Name</Label>
                        <Combobox<Model>
                            items={comfyuiModels}
                            value={avatarGenerationSettings.model}
                            onValueChange={(value) => setAvatarGenerationSettings({ ...avatarGenerationSettings, model: value })}
                            placeholder="Select a checkpoint..."
                            filterFn={(item, query) =>
                                item.id.toLowerCase().includes(query.toLowerCase())
                            }
                            itemToString={(item) => item.id}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
