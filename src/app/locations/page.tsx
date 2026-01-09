'use client';

import { LocationManager } from '@/components/location-manager/location-manager';
import { useEntityStore } from '@/lib/entityStore';
import { useParleyStore } from '@/lib/store';
import { WorldMapDisplay } from '@/components/world/WorldMapDisplay';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LocationsPage() {
    const { locations, addLocation, updateLocation, deleteLocation, characters } = useEntityStore();

    return (
        <div className="container mx-auto p-4">
            <h1 className="type-h2 mb-6">Location Management</h1>
            <LocationManager
                locations={locations || []}
                onAdd={addLocation}
                onUpdate={updateLocation}
                onDelete={deleteLocation}
                characters={characters}
            />

            <div className="mt-8">
                <h2 className="type-h3 mb-4">World Overview</h2>
                <Card>
                    <CardContent className="pt-6">
                        <WorldMapDisplay
                            mapImage={useParleyStore.getState().worldMapImage}
                            locations={locations || []}
                            className="bg-muted/20"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
