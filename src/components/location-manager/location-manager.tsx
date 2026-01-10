"use client";

import { useState, useRef, useEffect } from 'react';
import { Location, Character } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useParleyStore } from '@/lib/store';
import { WorldMapPicker } from '@/components/world/WorldMapPicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { useDebouncedCallback } from "use-debounce";

interface LocationManagerProps {
    locations: Location[];
    characters: Character[];
    onAdd: (location: Location) => void;
    onUpdate: (location: Location) => void;
    onDelete: (id: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function LocationManager({ locations, characters, onAdd, onUpdate, onDelete }: LocationManagerProps) {
    const { worldMapImage } = useParleyStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Location>>({});
    const [isCreating, setIsCreating] = useState(false);

    // Auto-save state
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const isDirtyRef = useRef(false);

    // Debounced update for EDIT MODE only
    const debouncedUpdate = useDebouncedCallback((location: Location) => {
        setSaveStatus('saving');
        try {
            onUpdate(location);
            setSaveStatus('saved');
            isDirtyRef.current = false;
            setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
        } catch (error) {
            console.error("Failed to save location", error);
            setSaveStatus('error');
        }
    }, 1000);

    const startCreating = () => {
        if (editingId && isDirtyRef.current) {
            debouncedUpdate.flush();
        }
        setEditingId(null);
        setIsCreating(true);
        setEditForm({ name: '', description: '', coordinates: { x: 50, y: 50 } });
        setSaveStatus('idle');
    };

    const startEditing = (location: Location) => {
        setIsCreating(false);
        setEditingId(location.id);
        setEditForm({ ...location });
        setSaveStatus('idle');
        isDirtyRef.current = false;
    };

    const cancelCreate = () => {
        setIsCreating(false);
        setEditForm({});
    };

    const closeEdit = () => {
        if (isDirtyRef.current && editingId && editForm.id) {
            // Ensure final state is saved immediately if closing
            debouncedUpdate.flush();
        }
        setEditingId(null);
        setEditForm({});
        setSaveStatus('idle');
    };

    // Manual Save for CREATION
    const handleCreateSave = () => {
        if (!editForm.name || !editForm.description) return;

        const locationData: Location = {
            id: uuidv4(),
            name: editForm.name,
            description: editForm.description,
            image: editForm.image,
            coordinates: editForm.coordinates || { x: 50, y: 50 },
        };

        onAdd(locationData);
        cancelCreate();
    };

    const handleInputChange = (field: keyof Location, value: any) => {
        setEditForm(prev => {
            const updated = { ...prev, [field]: value };

            // Only trigger auto-save if we are in EDIT mode (not creating)
            if (editingId && !isCreating) {
                // Determine if we have enough info to save (should inherently be true if we are editing an existing valid object, but safely checking ID)
                if (updated.id) {
                    isDirtyRef.current = true;
                    setSaveStatus('saving');
                    debouncedUpdate(updated as Location);
                }
            }
            return updated;
        });
    };

    const handleImageRemove = () => {
        handleInputChange('image', undefined);
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
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. The Grand Library"
                    />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="loc-desc" className="type-ui-label text-muted-foreground">Description</Label>
                    <Textarea
                        id="loc-desc"
                        value={editForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the atmosphere, smells, and sights..."
                        rows={5}
                    />
                </div>
            </TabsContent>
            <TabsContent value="map" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="type-ui-label text-muted-foreground">Location Image</Label>
                        <ImageUpload
                            value={editForm.image}
                            onChange={(val) => handleInputChange('image', val)}
                            onRemove={handleImageRemove}
                            label="Upload Location Image"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="type-ui-label text-muted-foreground">Map Position</Label>
                        {worldMapImage ? (
                            <div className="border rounded-lg overflow-hidden">
                                <WorldMapPicker
                                    mapImage={worldMapImage}
                                    initialCoordinates={editForm.coordinates}
                                    onCoordinatesChange={(coords) => handleInputChange('coordinates', coords)}
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
                {!isCreating && !editingId && (
                    <Button onClick={startCreating} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Location
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="mb-4 bg-muted/20 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="type-h4">New Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {renderEditForm()}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={cancelCreate}>Cancel</Button>
                        <Button onClick={handleCreateSave} disabled={!editForm.name || !editForm.description}>
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                    <Card key={location.id} className={`transition-all ${editingId === location.id ? "ring-2 ring-primary border-primary shadow-lg" : ""}`}>
                        {editingId === location.id ? (
                            <>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="type-h4">Edit Location</CardTitle>
                                    <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                                        {saveStatus === 'saving' && (
                                            <span className="text-muted-foreground flex items-center gap-1.5 animate-pulse">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving
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
                                                Error
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {renderEditForm()}
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    {/* For Edit Mode: we just have a 'Close' button since it auto-saves */}
                                    <Button onClick={closeEdit}>
                                        Done
                                    </Button>
                                </CardFooter>
                            </>
                        ) : (
                            <>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start type-h4 gap-2">
                                        <span className="truncate" title={location.name}>{location.name}</span>
                                        {!editingId && (
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(location)}>
                                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(location.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="type-body-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">{location.description}</p>
                                    <div>
                                        <h4 className="type-ui-label text-muted-foreground mb-2">Characters Here</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {characters.filter(c => c.locationId === location.id).length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {characters.filter(c => c.locationId === location.id).map(char => (
                                                        <div key={char.id} className="relative group">
                                                            <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-muted">
                                                                <img
                                                                    src={char.basicInfo.avatar}
                                                                    alt={char.basicInfo.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
                                                                {char.basicInfo.name}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
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
            </div>

            {!locations.length && !isCreating && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                    <p className="text-muted-foreground mb-4">No locations created yet.</p>
                    <Button onClick={startCreating}>
                        <Plus className="w-4 h-4 mr-2" /> Create First Location
                    </Button>
                </div>
            )}
        </div>
    );
}
