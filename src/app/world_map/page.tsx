'use client';

import { useParleyStore } from '@/lib/store';
import { useGameStore } from '@/lib/store/gameStore';
import { useEntityStore } from '@/lib/entityStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorldMapDisplay } from '@/components/world/WorldMapDisplay';

export default function WorldMapPage() {
    const router = useRouter();
    const { worldMapImage } = useParleyStore();
    const gameStore = useGameStore();
    const entityStore = useEntityStore();

    // Fallback to configuration locations if game state is not populated (e.g. dev/building mode)
    const displayLocations = (gameStore.locations && gameStore.locations.length > 0)
        ? gameStore.locations
        : entityStore.locations;

    const handleBack = () => {
        router.push('/');
    };

    const handleEnterChat = () => {
        router.push('/chat');
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            {/* Map Background */}
            {/* World Map Display */}
            {worldMapImage ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <WorldMapDisplay
                        mapImage={worldMapImage}
                        locations={displayLocations}
                        onLocationClick={handleEnterChat}
                        className="w-full h-full bg-transparent border-0"
                    />
                </div>
            ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-4">
                    <p>No World Map configured.</p>
                </div>
            )}

            {/* HUD / UI Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <Button variant="secondary" onClick={handleBack} className="pointer-events-auto shadow-lg/50 shadow-black border-white/10 backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Main Menu
                </Button>
            </div>

            <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
                <Button size="lg" onClick={handleEnterChat} className="pointer-events-auto shadow-lg shadow-primary/20 animate-pulse hover:animate-none">
                    <MessageSquare className="mr-2 h-5 w-5" /> Enter Chat
                </Button>
            </div>
        </div>
    );
}
