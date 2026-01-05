'use client';

import { LocationManager } from '@/components/location-manager/location-manager';
import { useEntityStore } from '@/lib/entityStore';

export default function LocationsPage() {
    const { locations, addLocation, updateLocation, deleteLocation } = useEntityStore();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-6">Location Management</h1>
            <LocationManager
                locations={locations || []}
                onAdd={addLocation}
                onUpdate={updateLocation}
                onDelete={deleteLocation}
            />
        </div>
    );
}
