import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntityStore } from "@/lib/entityStore";
import { useBioStore } from "@/lib/store/bioStore";
import { v4 as uuidv4 } from "uuid";

interface CreateEntityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultCategory?: string;
    onCreated: (categoryId: string, entityId: string) => void;
}

export function CreateEntityModal({ open, onOpenChange, defaultCategory, onCreated }: CreateEntityModalProps) {
    const { gameAttributeCategories, addGameAttribute } = useEntityStore();
    const { professions, getAllData, setData } = useBioStore();

    const [categoryId, setCategoryId] = useState<string>('');
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [minAge, setMinAge] = useState(16);
    const [maxAge, setMaxAge] = useState(75);
    const [relatedCount, setRelatedCount] = useState<number>(0);
    const [shareLastName, setShareLastName] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Populate category options
    const categoryOptions = [
        { id: 'profession', name: 'Profession' },
        ...(gameAttributeCategories || [])
    ];

    useEffect(() => {
        if (open) {
            setCategoryId(defaultCategory && defaultCategory !== 'NONE' ? defaultCategory : 'profession');
            setName("");
            setDescription("");
            setMinAge(16);
            setMaxAge(75);
            setRelatedCount(0);
            setShareLastName(false);
            setError(null);
        }
    }, [open, defaultCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId) {
            setError("Category is required");
            return;
        }
        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        if (categoryId === 'profession') {
            if (minAge > maxAge) {
                setError("Minimum age cannot be greater than maximum age");
                return;
            }

            // Create Profession logic
            // Requires a human-readable/string ID typically, we can auto-generate one from the name, or just use UUID like attributes to be safe.
            // Oh, since professions use named IDs like "WARRIOR", let's auto-slug it.
            const newId = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');

            // Uniqueness check
            if ((professions || []).some(p => p.id === newId)) {
                setError(`A profession with a similar name (${newId}) already exists`);
                return;
            }

            const newProfession = {
                id: newId,
                name: name.trim(),
                description: description.trim(),
                categoryId: 'profession' as const,
                minAge,
                maxAge
            };

            const storeData = getAllData();
            setData({
                ...storeData,
                professions: [...(storeData.professions || []), newProfession]
            });
            onCreated('profession', newId);
            onOpenChange(false);
        } else {
            // Create Game Attribute
            const newAttr = {
                id: uuidv4(),
                categoryId,
                name: name.trim(),
                description: description.trim(),
                relatedCharacterCount: relatedCount,
                shareLastName: shareLastName,
            };
            addGameAttribute(newAttr);
            onCreated(categoryId, newAttr.id);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Entity</DialogTitle>
                    <DialogDescription>
                        Create a new game attribute or profession to map to this node.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wealthy Family"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional explanation..."
                        />
                    </div>

                    {categoryId === 'profession' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Minimum Age</Label>
                                <Input
                                    type="number"
                                    value={minAge}
                                    onChange={(e) => setMinAge(parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Maximum Age</Label>
                                <Input
                                    type="number"
                                    value={maxAge}
                                    onChange={(e) => setMaxAge(parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}

                    {categoryId !== 'profession' && categoryId !== '' && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Placeholder Characters</Label>
                                <Input
                                    type="number"
                                    value={relatedCount}
                                    onChange={(e) => setRelatedCount(parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                                <div className="text-xs text-muted-foreground">Number of characters to auto-generate for this relation.</div>
                            </div>
                            <div className="space-y-2 pt-6">
                                <label className="flex items-center gap-2 text-sm font-medium leading-none">
                                    <input
                                        type="checkbox"
                                        checked={shareLastName}
                                        onChange={(e) => setShareLastName(e.target.checked)}
                                        className="h-4 w-4 bg-transparent border-primary/50"
                                    />
                                    Share Last Name
                                </label>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
