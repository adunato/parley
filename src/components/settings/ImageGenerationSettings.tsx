"use client";

import { PromptConfig } from "@/lib/store/promptStore";
import { PromptEditor } from "./PromptEditor";

interface ImageGenerationSettingsProps {
    prompts: Record<string, PromptConfig>;
    onSave: (id: string, template: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
}

const IMAGE_PROMPT_IDS = [
    'avatar_desc'
];

export function ImageGenerationSettings({ prompts, onSave, onReset }: ImageGenerationSettingsProps) {
    const imagePrompts = Object.fromEntries(
        Object.entries(prompts).filter(([key]) => IMAGE_PROMPT_IDS.includes(key))
    );

    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Image Generation Prompts</h3>
            <p className="text-sm text-muted-foreground">
                Configure the templates used for generating descriptions for image generation.
            </p>
            <PromptEditor prompts={imagePrompts} onSave={onSave} onReset={onReset} />
        </div>
    );
}
