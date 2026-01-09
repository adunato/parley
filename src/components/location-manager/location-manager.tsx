"use client";

import { useState } from 'react';
import { Location, Character } from '@/lib/types'; // Assuming Location is in types.ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, Save, X, ImageIcon, Upload, Map as MapIcon } from 'lucide-react'; // Added MapIcon as alias to avoid conflict if needed, though not strictly necessary
import { v4 as uuidv4 } from 'uuid';
import { useParleyStore } from '@/lib/store';
import { WorldMapPicker } from '@/components/world/WorldMapPicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LocationManagerProps {
    locations: Location[];
    characters: Character[];
    onAdd: (location: Location) => void;
    onUpdate: (location: Location) => void;
    onDelete: (id: string) => void;
}

export function LocationManager({ locations, characters, onAdd, onUpdate, onDelete }: LocationManagerProps) {
    const { worldMapImage } = useParleyStore();
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

        const locationData = {
            name: editForm.name,
            description: editForm.description,
            image: editForm.image,
            coordinates: editForm.coordinates,
        };

        if (isCreating) {
            onAdd({
                id: uuidv4(),
                ...locationData,
            });
        } else if (editingId) {
            onUpdate({
                id: editingId,
                ...locationData,
            } as Location);
        }
        cancelEdit();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Logic for rendering the Edit Form content (reused for both Create and Edit modes)
    const renderEditForm = () => (
        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="map">Map & Appearance</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="loc-name" className="type-ui-label text-muted-foreground">Name</Label>
                    <Input
                        id="loc-name"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. The Grand Library"
                    />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="loc-desc" className="type-ui-label text-muted-foreground">Description</Label>
                    <Textarea
                        id="loc-desc"
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the atmosphere, smells, and sights..."
                        rows={5}
                    />
                </div>
            </TabsContent>
            <TabsContent value="map" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="type-ui-label text-muted-foreground">Location Image</Label>
                        <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 relative bg-muted/20 min-h-[150px]">
                            {editForm.image ? (
                                <>
                                    <img src={editForm.image} alt="Preview" className="w-full h-32 object-contain rounded" />
                                    <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => setEditForm(prev => ({ ...prev, image: undefined }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">Upload Image</span>
                                </div>
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="type-ui-label text-muted-foreground">Map Position</Label>
                        {worldMapImage ? (
                            <div className="border rounded-lg overflow-hidden">
                                <WorldMapPicker
                                    mapImage={worldMapImage}
                                    initialCoordinates={editForm.coordinates}
                                    onCoordinatesChange={(coords) => setEditForm(prev => ({ ...prev, coordinates: coords }))}
                                    locationImage={editForm.image}
                                    locationName={editForm.name}
                                    className="w-full aspect-video"
                                />
                            </div>
                        ) : (
                            <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm bg-muted/10">
                                <p>No World Map configured.</p>
                                <p>Go to World Info to upload a map.</p>
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );

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
                        {renderEditForm()}
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
                                    {renderEditForm()}
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
