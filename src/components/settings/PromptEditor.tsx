"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PromptConfig } from "@/lib/store/promptStore";

interface PromptEditorProps {
    prompts: Record<string, PromptConfig>;
    onSave: (id: string, template: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
}

export function PromptEditor({ prompts, onSave, onReset }: PromptEditorProps) {
    const [selectedPromptId, setSelectedPromptId] = useState<string>("");
    const [currentTemplate, setCurrentTemplate] = useState<string>("");
    const [isDirty, setIsDirty] = useState(false);

    // Set initial selection
    useEffect(() => {
        if (!selectedPromptId && Object.keys(prompts).length > 0) {
            const firstId = Object.keys(prompts)[0];
            setSelectedPromptId(firstId);
            setCurrentTemplate(prompts[firstId].template);
        }
    }, [prompts, selectedPromptId]);

    // Update template when selection changes (if not dirty? or force switch?)
    // Basic logic: switch immediately, maybe warn if dirty later. For now, simple switch.
    const handlePromptChange = (value: string) => {
        if (prompts[value]) {
            setSelectedPromptId(value);
            setCurrentTemplate(prompts[value].template);
            setIsDirty(false);
        }
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentTemplate(e.target.value);
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (selectedPromptId) {
            await onSave(selectedPromptId, currentTemplate);
            setIsDirty(false);
        }
    };

    const handleReset = async () => {
        if (selectedPromptId) {
            await onReset(selectedPromptId);
            // After reset, we need to update the local state with the new (default) template.
            // But the parent will likely re-fetch prompts.
            // We'll rely on the parent updating the `prompts` prop.
        }
    };

    // React to props update for the CURRENTLY selected prompt
    useEffect(() => {
        if (selectedPromptId && prompts[selectedPromptId] && !isDirty) {
            setCurrentTemplate(prompts[selectedPromptId].template);
        }
    }, [prompts, selectedPromptId, isDirty]);


    const currentConfig = prompts[selectedPromptId];

    if (!currentConfig) return <div className="text-sm text-muted-foreground animate-pulse">Loading prompts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div className="w-1/2 space-y-2">
                    <Label htmlFor="prompt-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Prompt to Edit</Label>
                    <Select value={selectedPromptId} onValueChange={handlePromptChange}>
                        <SelectTrigger id="prompt-select" className="h-10">
                            <SelectValue placeholder="Select a prompt" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {Object.values(prompts).map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-x-2 pb-0.5">
                    <Button variant="outline" onClick={handleReset} disabled={!selectedPromptId} className="uppercase tracking-wider font-bold text-xs">
                        Reset Default
                    </Button>
                    <Button onClick={handleSave} disabled={!isDirty} className="uppercase tracking-wider font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="space-y-2 bg-muted/20 p-4 rounded-md border border-border">
                <Label className="text-sm font-semibold text-foreground">{currentConfig.description}</Label>
                <div className="text-xs text-muted-foreground pt-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground/70 mr-2">Variables:</span>
                    <span className="font-mono bg-muted px-1 py-0.5 rounded">{currentConfig.variables.map(v => `{{${v}}}`).join(", ")}</span>
                </div>
            </div>

            <Textarea
                value={currentTemplate}
                onChange={handleTemplateChange}
                className="font-mono text-sm min-h-[400px]"
                spellCheck={false}
            />
        </div>
    );
}
