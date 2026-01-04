"use client";

import { useParleyStore } from "@/lib/store";
import { PromptConfig } from "@/lib/store/promptStore";
import { PromptEditor } from "./PromptEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

interface Model {
    id: string;
    name: string;
    provider: string;
}

interface ImageGenerationSettingsProps {
    prompts: Record<string, PromptConfig>;
    comfyuiModels: Model[];
    onSave: (id: string, template: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
}

const IMAGE_PROMPT_IDS = [
    'avatar_desc'
];

export function ImageGenerationSettings({ prompts, comfyuiModels, onSave, onReset }: ImageGenerationSettingsProps) {
    const { avatarGenerationSettings, setAvatarGenerationSettings } = useParleyStore();

    const imagePrompts = Object.fromEntries(
        Object.entries(prompts).filter(([key]) => IMAGE_PROMPT_IDS.includes(key))
    );

    return (
        <div className="space-y-8 pt-4">
            {/* ComfyUI Settings Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">ComfyUI Settings</h2>
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

            <hr className="my-6 border-muted" />

            {/* Prompt Config Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Prompt Configuration</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Configure the templates used for generating descriptions for image generation.
                </p>
                <PromptEditor prompts={imagePrompts} onSave={onSave} onReset={onReset} />
            </section>
        </div>
    );
}
