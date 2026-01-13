import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagSelector } from "./tag-selector";
import { Plus, Trash2 } from "lucide-react";
import { Label } from '@/components/ui/label';
import { useBioStore } from "@/lib/store/bioStore";

interface WeightEditorProps {
    weights: { [tag: string]: number; "DEFAULT": number };
    onChange: (weights: { [tag: string]: number; "DEFAULT": number }) => void;
}

export function WeightEditor({ weights, onChange }: WeightEditorProps) {
    const [newTag, setNewTag] = useState('');
    const [newValue, setNewValue] = useState<number>(1);

    const handleAdd = () => {
        if (!newTag.trim()) return;
        const tag = newTag.trim().toUpperCase().replace(/\s+/g, '_');
        onChange({ ...weights, [tag]: newValue });
        useBioStore.getState().registerTags([tag]);
        setNewTag('');
        setNewValue(1);
    };

    const handleRemove = (tag: string) => {
        const next = { ...weights };
        delete next[tag];
        onChange(next);
    };

    const handleUpdate = (tag: string, val: number) => {
        onChange({ ...weights, [tag]: val });
    };

    return (
        <div className="space-y-3 border p-3 rounded-md bg-muted/20">
            <Label>Weights (Probability Modifiers)</Label>

            {/* Default Weight */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold w-24">DEFAULT</span>
                <Input
                    type="number"
                    value={weights.DEFAULT}
                    onChange={e => handleUpdate('DEFAULT', parseFloat(e.target.value))}
                    className="w-24 h-8"
                    step={0.1}
                />
                <span className="text-xs text-muted-foreground">Base probability weight</span>
            </div>

            {/* Other Weights */}
            <div className="space-y-2">
                {Object.entries(weights).map(([tag, val]) => {
                    if (tag === 'DEFAULT') return null;
                    return (
                        <div key={tag} className="flex items-center gap-2">
                            <span className="text-sm font-mono w-24 truncate" title={tag}>{tag}</span>
                            <Input
                                type="number"
                                value={val}
                                onChange={e => handleUpdate(tag, parseFloat(e.target.value))}
                                className="w-24 h-8"
                                step={0.1}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(tag)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Add New */}
            <div className="flex gap-2 items-end pt-2 border-t mt-2">
                <div className="flex-1">
                    <TagSelector
                        placeholder="TAG_NAME"
                        value={newTag}
                        onValueChange={setNewTag}
                        className="h-8 text-xs"
                    />
                </div>
                <div className="w-24">
                    <Input
                        type="number"
                        value={newValue}
                        onChange={e => setNewValue(parseFloat(e.target.value))}
                        className="h-8"
                        step={0.1}
                    />
                </div>
                <Button size="sm" variant="outline" onClick={handleAdd} disabled={!newTag.trim()}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
