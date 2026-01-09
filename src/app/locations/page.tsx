'use client';

import { LocationManager } from '@/components/location-manager/location-manager';
import { useEntityStore } from '@/lib/entityStore';

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
        </div>
    );
}
