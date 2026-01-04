"use client";

import { PromptConfig } from "@/lib/store/promptStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./GeneralSettings";
import { TextGenerationSettings } from "./TextGenerationSettings";
import { ImageGenerationSettings } from "./ImageGenerationSettings";

interface Model {
    id: string;
    name: string;
    provider: string;
}

interface SettingsTabsProps {
    models: Model[];
    comfyuiModels: Model[];
    prompts: Record<string, PromptConfig>;
    onSavePrompt: (id: string, template: string) => Promise<void>;
    onResetPrompt: (id: string) => Promise<void>;
}

export function SettingsTabs({
    models,
    comfyuiModels,
    prompts,
    onSavePrompt,
    onResetPrompt
}: SettingsTabsProps) {
    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="text">Text Generation</TabsTrigger>
                <TabsTrigger value="image">Image Generation</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <GeneralSettings models={models} />
            </TabsContent>

            <TabsContent value="text">
                <TextGenerationSettings
                    prompts={prompts}
                    onSave={onSavePrompt}
                    onReset={onResetPrompt}
                />
            </TabsContent>

            <TabsContent value="image">
                <ImageGenerationSettings
                    prompts={prompts}
                    comfyuiModels={comfyuiModels}
                    onSave={onSavePrompt}
                    onReset={onResetPrompt}
                />
            </TabsContent>
        </Tabs>
    );
}
