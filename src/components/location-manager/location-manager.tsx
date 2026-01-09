import { useState } from 'react';
import { Location, Character } from '@/lib/types'; // Assuming Location is in types.ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LocationManagerProps {
    locations: Location[];
    characters: Character[];
    onAdd: (location: Location) => void;
    onUpdate: (location: Location) => void;
    onDelete: (id: string) => void;
}

export function LocationManager({ locations, characters, onAdd, onUpdate, onDelete }: LocationManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Location>>({});
    const [isCreating, setIsCreating] = useState(false);

    const startCreating = () => {
        setIsCreating(true);
        setEditForm({ name: '', description: '' });
    };

    const startEditing = (location: Location) => {
        setEditingId(location.id);
        setEditForm({ ...location });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setEditForm({});
    };

    const handleSave = () => {
        if (!editForm.name || !editForm.description) return;

        if (isCreating) {
            onAdd({
                id: uuidv4(),
                name: editForm.name,
                description: editForm.description,
            });
        } else if (editingId) {
            onUpdate({
                id: editingId,
                name: editForm.name,
                description: editForm.description,
            } as Location);
        }
        cancelEdit();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center">
                {!isCreating && (
                    <Button onClick={startCreating} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Location
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="mb-4 bg-muted/20 border-dashed">
                    <CardHeader>
                        <CardTitle className="type-h4">New Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="new-name" className="type-ui-label text-muted-foreground">Name</Label>
                            <Input
                                id="new-name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. The Grand Library"
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="new-desc" className="type-ui-label text-muted-foreground">Description</Label>
                            <Textarea
                                id="new-desc"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the atmosphere, smells, and sights..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!editForm.name || !editForm.description}>Save</Button>
                    </CardFooter>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                    <Card key={location.id} className={editingId === location.id ? "border-blue-500" : ""}>
                        {editingId === location.id ? (
                            <>
                                <CardHeader>
                                    <CardTitle className="type-h4">Edit Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label className="type-ui-label text-muted-foreground">Name</Label>
                                        <Input
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label className="type-ui-label text-muted-foreground">Description</Label>
                                        <Textarea
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                                    <Button size="sm" onClick={handleSave}><Save className="w-4 h-4" /></Button>
                                </CardFooter>
                            </>
                        ) : (
                            <>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center type-h4">
                                        <span>{location.name}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEditing(location)}>
                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onDelete(location.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="type-body-sm text-muted-foreground line-clamp-3 mb-4">{location.description}</p>
                                    <div>
                                        <h4 className="type-ui-label text-muted-foreground mb-2">Characters Here</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {characters.filter(c => c.locationId === location.id).length > 0 ? (
                                                characters.filter(c => c.locationId === location.id).map(char => (
                                                    <span key={char.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {char.basicInfo.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="type-body-xs text-muted-foreground italic">No characters assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                ))}
                {!locations.length && !isCreating && (
                    <div className="col-span-full type-body-base text-muted-foreground text-center py-8">
                        No locations defined yet.
                    </div>
                )}
            </div>
        </div>
    );
}
