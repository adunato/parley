"use client";

import { useState } from 'react';
import { useParleyStore } from '@/lib/store';
import { useGameStore } from '@/lib/store/gameStore';
import { useEntityStore } from '@/lib/entityStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorldMapDisplay } from '@/components/world/WorldMapDisplay';
import { LocationPopup } from '@/components/world/LocationPopup';
import { Location } from '@/lib/types';
import { GameplayToolbar } from '@/components/gameplay-toolbar';
import { useMemo } from 'react';

export default function WorldMapPage() {
    const router = useRouter();
    const { worldMapImage } = useParleyStore();
    const gameStore = useGameStore();
    const entityStore = useEntityStore();
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Fallback to configuration locations if game state is not populated (e.g. dev/building mode)
    const displayLocations = (gameStore.locations && gameStore.locations.length > 0)
        ? gameStore.locations
        : entityStore.locations;

    const handleBack = () => {
        router.push('/');
    };

    const handleLocationClick = (location: Location) => {
        setSelectedLocation(location);
    };

    const handleExitGame = () => {
        router.push('/');
    };

    const handleOpenSettings = () => {
        console.log("Settings clicked");
        router.push('/settings');
    };

    // Derived current persona from store if available
    const currentPersona = useMemo(() => {
        if (!gameStore.currentPersonaId || !gameStore.playerPersonas) return undefined;
        return gameStore.playerPersonas.find(p => p.id === gameStore.currentPersonaId);
    }, [gameStore.currentPersonaId, gameStore.playerPersonas]);

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
            {/* Gameplay Toolbar - Full width at top */}
            <div className="z-50 w-full absolute top-0 left-0">
                <GameplayToolbar
                    currentDay={1} // Placeholder, need GameState day
                    timeOfDay={"Morning"} // Placeholder, need GameState time
                    personaName={currentPersona?.basicInfo?.name}
                    personaImageSrc={currentPersona?.basicInfo?.avatar}
                    onExitGame={handleExitGame}
                    onOpenSettings={handleOpenSettings}
                    className="border-b-white/10 bg-black/60 shadow-lg"
                />
            </div>
            {/* Map Background */}
            {/* World Map Display */}
            {worldMapImage ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <WorldMapDisplay
                        mapImage={worldMapImage}
                        locations={displayLocations}
                        onLocationClick={handleLocationClick}
                        className="w-full h-full bg-transparent border-0"
                    />
                </div>
            ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-4">
                    <p>No World Map configured.</p>
                </div>
            )}

            {/* HUD / UI Overlay 
                REMOVED: Old 'Main Menu' button is replaced by Toolbar 'Exit' icon.
                Retaining original div comment for clarity if needed, but removing button.
            */}
            {/* <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <Button variant="secondary" onClick={handleBack} className="pointer-events-auto shadow-lg/50 shadow-black border-white/10 backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Main Menu
                </Button>
            </div> */}

            <LocationPopup
                isOpen={!!selectedLocation}
                onClose={() => setSelectedLocation(null)}
                location={selectedLocation}
            />
        </div >
    );
}
