"use client";

import { useState, useEffect, useRef } from "react";
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
import { useDebouncedCallback } from "use-debounce";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PromptEditorProps {
    prompts: Record<string, PromptConfig>;
    onSave: (id: string, template: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function PromptEditor({ prompts, onSave, onReset }: PromptEditorProps) {
    const [selectedPromptId, setSelectedPromptId] = useState<string>("");
    const [currentTemplate, setCurrentTemplate] = useState<string>("");
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    // Track if the current template has modifications that haven't been flushed yet
    // This helps us avoid saving when switching IF no changes were made
    const isDirtyRef = useRef(false);

    // Initial Load
    useEffect(() => {
        if (!selectedPromptId && Object.keys(prompts).length > 0) {
            const firstId = Object.keys(prompts)[0];
            setSelectedPromptId(firstId);
            setCurrentTemplate(prompts[firstId].template);
        }
    }, [prompts, selectedPromptId]);

    // Debounced Save
    const debouncedSave = useDebouncedCallback(async (id: string, template: string) => {
        if (!id) return;
        setSaveStatus('saving');
        try {
            await onSave(id, template);
            setSaveStatus('saved');
            isDirtyRef.current = false;

            // Reset "saved" status after a delay
            setTimeout(() => {
                setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
            }, 2000);
        } catch (error) {
            console.error("Auto-save failed", error);
            setSaveStatus('error');
        }
    }, 1000);

    const handlePromptChange = (value: string) => {
        // FLUSH any pending saves for the OLD prompt before switching
        if (selectedPromptId && isDirtyRef.current) {
            debouncedSave.flush();
        }

        if (prompts[value]) {
            setSelectedPromptId(value);
            setCurrentTemplate(prompts[value].template);
            setSaveStatus('idle');
            isDirtyRef.current = false;
        }
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setCurrentTemplate(newValue);
        isDirtyRef.current = true;
        setSaveStatus('saving'); // UI feedback immediately
        debouncedSave(selectedPromptId, newValue);
    };

    const handleReset = async () => {
        if (selectedPromptId) {
            // Cancel any pending saves
            debouncedSave.cancel();

            await onReset(selectedPromptId);
            setSaveStatus('idle');
            isDirtyRef.current = false;
        }
    };

    // React to props update for the CURRENTLY selected prompt (external updates)
    useEffect(() => {
        // Only update if we are NOT currently editing (dirty) to avoid overwriting user while they type
        // and only if the external value is different
        if (selectedPromptId && prompts[selectedPromptId] && !isDirtyRef.current) {
            // We check strictly to avoid unnecessary re-renders or loops
            if (prompts[selectedPromptId].template !== currentTemplate) {
                setCurrentTemplate(prompts[selectedPromptId].template);
            }
        }
    }, [prompts, selectedPromptId, currentTemplate]);

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
                <div className="flex items-center gap-4">
                    {/* Status Indicator */}
                    <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                        {saveStatus === 'saving' && (
                            <span className="text-muted-foreground flex items-center gap-1.5 animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                            </span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="text-green-500 flex items-center gap-1.5 transition-opacity duration-500">
                                <CheckCircle className="w-3 h-3" />
                                Saved
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-destructive flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                Save Failed
                            </span>
                        )}
                    </div>

                    <Button variant="outline" onClick={handleReset} disabled={!selectedPromptId || saveStatus === 'saving'} className="uppercase tracking-wider font-bold text-xs">
                        Reset Default
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
