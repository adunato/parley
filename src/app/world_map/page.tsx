'use client';

import { useParleyStore } from '@/lib/store';
import { useGameStore } from '@/lib/store/gameStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WorldMapPage() {
    const router = useRouter();
    const { worldMapImage } = useParleyStore();
    const { locations } = useGameStore();

    const handleBack = () => {
        router.push('/');
    };

    const handleEnterChat = () => {
        router.push('/chat');
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            {/* Map Background */}
            {worldMapImage ? (
                <div className="relative w-full h-full">
                    {/* We use a container that preserves aspect ratio or covers? 
                       Requirement says "make sure width fits the screen with no horizontal scrolling".
                       "Full screen map".
                       If we use object-contain, we might have black bars. 
                       If we use object-cover, we crop.
                       "Width fits the screen" -> sounds like object-contain or w-full h-auto?
                       But it's "full screen map", so likely cover.
                       However, pins are absolute %. Cover changes visible area ratio if screen ratio != image ratio.
                       To keep pins accurate, we need the container to match the image ratio or utilize a specific technique.
                       
                       Simplest approach for responsive pins is to have a container that matches image aspect ratio 
                       and fits within the viewport (contain).
                       
                       Let's go with object-cover for immersion, BUT pin positions might drift if we crop.
                       Actually, strictly speaking, if we use % coordinates on an element, they stay relative to that element.
                       So if we just scale the element, it works.
                       If we crop (object-cover on a div), we lose parts of the map.
                       
                       Let's try to fit width 100% and let height auto (scrolling?) -> "No horizontal scrolling".
                       Requirement doesn't say no vertical scrolling.
                       But "World_map will be made of a full screen map".
                       
                       Let's try a centralized container that fits within the viewport (contain) to be safe for pins.
                   */}
                    <img
                        src={worldMapImage}
                        alt="World Map"
                        className="w-full h-full object-cover"
                    />

                    {/* Pins Overlay - We need this to match the visible area of the image if object-cover is used?
                       No, if object-cover is used on the img tag, the img tag still fills the container visually, 
                       but the content is cropped.
                       Wait, if I use a background image with background-size: cover, I can't place pins easily.
                       
                       Better approach:
                       A container that scales to fit the screen while maintaining aspect ratio (like letterboxing).
                       Then the pins are relative to THAT container.
                   */}
                </div>
            ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-4">
                    <p>No World Map configured.</p>
                </div>
            )}

            {/* If we use the object-cover approach above, pins might be off-screen. 
                Let's use a "Fit to screen" approach with letterboxing for correctness of pins.
            */}
            {worldMapImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative max-w-full max-h-full aspect-video">
                        {/* This aspect-video is an assumption. We should probably let it be natural.
                             But we don't know the natural AR easily without loading.
                             Start with w-full h-full and object-contain?
                             
                             Let's simple put the pins in a container that overlays exactly the image.
                         */}
                        <img
                            src={worldMapImage}
                            alt="World Map Ref"
                            className="max-w-full max-h-full w-auto h-auto object-contain opacity-0" // Inverse: use this to set size
                        />

                        {/* Actual visible map + pins container */}
                        <div className="absolute inset-0">
                            {/* We need the REAL image here to show it? 
                                Or we can just use the one above but remove opacity-0 and remove the background one?
                                Yes.
                            */}
                            <img
                                src={worldMapImage}
                                alt="World Map"
                                className="w-full h-full object-contain pointer-events-auto"
                            />

                            {locations?.map((location) => {
                                if (!location.coordinates) return null;
                                return (
                                    <div
                                        key={location.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
                                        style={{
                                            left: `${location.coordinates.x}%`,
                                            top: `${location.coordinates.y}%`
                                        }}
                                        onClick={handleEnterChat} // Or open details
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative transition-transform hover:scale-110">
                                                        {location.image ? (
                                                            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-background shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                                                <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <MapPin className="text-primary fill-primary w-10 h-10 drop-shadow-lg -mt-5" />
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{location.name}</p>
                                                    <p className="text-xs max-w-[200px]">{location.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
