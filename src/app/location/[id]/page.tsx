"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';
import { useEntityStore } from '@/lib/entityStore';
import { useParleyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { CharacterCard } from '@/components/character/CharacterCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function LocationScreen() {
    const params = useParams();
    const router = useRouter();
    const { locations: gameLocations, characters: gameCharacters } = useGameStore();
    const { locations: entityLocations, characters: entityCharacters } = useEntityStore(); // Need to import useEntityStore

    const locations = (gameLocations && gameLocations.length > 0) ? gameLocations : entityLocations;
    const characters = (gameCharacters && gameCharacters.length > 0) ? gameCharacters : entityCharacters;
    const { _hasHydrated } = useParleyStore();

    // We need to wait for store hydration
    if (!_hasHydrated) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const locationId = params.id as string;
    const location = locations.find(l => l.id === locationId);

    // Filter characters at this location
    const locationCharacters = characters.filter(c => c.locationId === locationId);

    if (!location) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="type-h2">Location Not Found</h1>
                <Button onClick={() => router.push('/world_map')}>Back to Map</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                {location.image ? (
                    <div className="w-full h-64 md:h-96 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
                        <img
                            src={location.image}
                            alt={location.name}
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 bg-secondary/30 border-b border-border" />
                )}
            </div>

            {/* Content Layer */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-8 hover:bg-background/50 backdrop-blur-sm"
                    onClick={() => router.push('/world_map')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Map
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h1 className="type-h1 mb-2 drop-shadow-md">{location.name}</h1>
                            <div className="flex items-center text-muted-foreground mb-4">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium uppercase tracking-wider">
                                    X: {Math.round(location.coordinates?.x || 0)}, Y: {Math.round(location.coordinates?.y || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="type-body-lg text-foreground/90 leading-relaxed">
                                {location.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Characters */}
                    <div className="lg:col-span-2">
                        <h2 className="type-h3 mb-6 flex items-center gap-2">
                            Characters Nearby
                            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                {locationCharacters.length}
                            </span>
                        </h2>

                        {locationCharacters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {locationCharacters.map(char => (
                                    <CharacterCard
                                        key={char.id}
                                        character={char}
                                        locationId={locationId}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-secondary/10">
                                <p className="text-muted-foreground">No characters currently at this location.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
