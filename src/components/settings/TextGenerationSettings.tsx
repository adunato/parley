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
    'analyst_system',
    'bio_writer',
    'life_event_gen',
    'spine_event_gen'
];

export function TextGenerationSettings({ prompts, onSave, onReset }: TextGenerationSettingsProps) {
    const textPrompts = Object.fromEntries(
        Object.entries(prompts).filter(([key]) => TEXT_PROMPT_IDS.includes(key))
    );

    return (
        <div className="space-y-6 pt-6">
            <div className="border-b border-border pb-4">
                <h3 className="type-h4 text-foreground">Text Generation Prompts</h3>
                <p className="type-body-sm text-muted-foreground mt-1">
                    Configure the templates used for generating text, characters, relationships, and analysis.
                </p>
            </div>
            <PromptEditor prompts={textPrompts} onSave={onSave} onReset={onReset} />
        </div>
    );
}
