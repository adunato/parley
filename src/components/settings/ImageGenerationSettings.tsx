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
        <div className="space-y-8 pt-6">
            {/* ComfyUI Settings Section */}
            <section className="space-y-6">
                <div className="border-b border-border pb-2">
                    <h2 className="type-h4 text-foreground">ComfyUI Settings</h2>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="width" className="type-ui-label text-muted-foreground">Width</Label>
                            <Input
                                id="width"
                                type="number"
                                value={avatarGenerationSettings.width}
                                onChange={(e) => setAvatarGenerationSettings({ width: parseInt(e.target.value) || 0 })}
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height" className="type-ui-label text-muted-foreground">Height</Label>
                            <Input
                                id="height"
                                type="number"
                                value={avatarGenerationSettings.height}
                                onChange={(e) => setAvatarGenerationSettings({ height: parseInt(e.target.value) || 0 })}
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="steps" className="type-ui-label text-muted-foreground">Steps</Label>
                            <Input
                                id="steps"
                                type="number"
                                value={avatarGenerationSettings.steps}
                                onChange={(e) => setAvatarGenerationSettings({ steps: parseInt(e.target.value) || 0 })}
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cfg" className="type-ui-label text-muted-foreground">CFG Scale</Label>
                            <Input
                                id="cfg"
                                type="number"
                                step="0.1"
                                value={avatarGenerationSettings.cfg}
                                onChange={(e) => setAvatarGenerationSettings({ cfg: parseFloat(e.target.value) || 0 })}
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seed" className="type-ui-label text-muted-foreground">Seed (-1 for random)</Label>
                            <Input
                                id="seed"
                                type="number"
                                value={avatarGenerationSettings.seed}
                                onChange={(e) => setAvatarGenerationSettings({ seed: parseInt(e.target.value) })}
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="negative-prompt" className="type-ui-label text-muted-foreground">Negative Prompt</Label>
                        <Textarea
                            id="negative-prompt"
                            value={avatarGenerationSettings.negativePrompt}
                            onChange={(e) => setAvatarGenerationSettings({ ...avatarGenerationSettings, negativePrompt: e.target.value })}
                            placeholder="Enter negative prompt..."
                            className="font-sans min-h-[100px]"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="model" className="type-ui-label text-muted-foreground">Model Checkpoint Name</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="comfyui-address" className="type-ui-label text-muted-foreground">ComfyUI Address</Label>
                            <Input
                                id="comfyui-address"
                                value={avatarGenerationSettings.comfyuiAddress}
                                onChange={(e) => setAvatarGenerationSettings({ ...avatarGenerationSettings, comfyuiAddress: e.target.value })}
                                placeholder="127.0.0.1:8188"
                                className="font-mono"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="my-8 border-border" />

            {/* Prompt Config Section */}
            <section className="space-y-6">
                <div className="border-b border-border pb-2">
                    <h2 className="type-h4 text-foreground">Prompt Configuration</h2>
                    <p className="type-body-sm text-muted-foreground mt-1">
                        Configure the templates used for generating descriptions for image generation.
                    </p>
                </div>
                <PromptEditor prompts={imagePrompts} onSave={onSave} onReset={onReset} />
            </section>
        </div>
    );
}
