import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagSelector } from "./tag-selector";
import { X, Plus } from "lucide-react";
import { useBioStore } from "@/lib/store/bioStore";

interface TagListEditorProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    placeholder?: string;
}

export function TagListEditor({ tags, onChange, label, placeholder }: TagListEditorProps) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        const newTag = inputValue.trim().toUpperCase().replace(/\s+/g, '_');
        if (!tags.includes(newTag)) {
            onChange([...tags, newTag]);
            useBioStore.getState().registerTags([newTag]);
        }
        setInputValue('');
    };

    const handleRemove = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium">{label}</label>}
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemove(tag)}
                        />
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <TagSelector
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Add tag..."}
                    className="h-8 text-sm"
                />
                <Button onClick={handleAdd} size="sm" variant="outline" type="button">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
