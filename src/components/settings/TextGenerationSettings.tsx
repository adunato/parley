"use client";

import { PromptConfig } from "@/lib/store/promptStore";
import { PromptEditor } from "./PromptEditor";

interface TextGenerationSettingsProps {
    prompts: Record<string, PromptConfig>;
    onSave: (id: string, template: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
}

const TEXT_PROMPT_IDS = [
    'chat_system',
    'world_gen',
    'character_gen',
    'persona_gen',
    'relationship_gen',
    'relationship_delta',
    'ai_style_gen',
    'chat_summary',
    'analyst_system'
];

export function TextGenerationSettings({ prompts, onSave, onReset }: TextGenerationSettingsProps) {
    const textPrompts = Object.fromEntries(
        Object.entries(prompts).filter(([key]) => TEXT_PROMPT_IDS.includes(key))
    );

    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Text Generation Prompts</h3>
            <p className="text-sm text-muted-foreground">
                Configure the templates used for generating text, characters, relationships, and analysis.
            </p>
            <PromptEditor prompts={textPrompts} onSave={onSave} onReset={onReset} />
        </div>
    );
}
