"use client";

import { Location } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorldMapDisplayProps {
    mapImage?: string;
    locations: Location[];
    onLocationClick?: (location: Location) => void;
    className?: string;
}

export function WorldMapDisplay({
    mapImage,
    locations,
    onLocationClick,
    className
}: WorldMapDisplayProps) {

    if (!mapImage) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10", className)}>
                <p>No World Map configured.</p>
            </div>
        );
    }

    return (
        <div className={cn("relative flex items-center justify-center bg-black/5 overflow-hidden rounded-lg border", className)}>
            {/* Aspect Ratio preservation container */}
            <div className="relative max-w-full max-h-full aspect-video">
                {/* Reference Image to set container size */}
                <img
                    src={mapImage}
                    alt="World Map Ref"
                    className="max-w-full max-h-full w-auto h-auto object-contain opacity-0 pointer-events-none"
                />

                {/* Actual visible map + pins container */}
                <div className="absolute inset-0">
                    <img
                        src={mapImage}
                        alt="World Map"
                        className="w-full h-full object-contain pointer-events-auto"
                    />

                    {locations?.map((location) => {
                        if (!location.coordinates) return null;
                        return (
                            <div
                                key={location.id}
                                className={cn(
                                    "absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group",
                                    onLocationClick ? "cursor-pointer" : "cursor-default"
                                )}
                                style={{
                                    left: `${location.coordinates.x}%`,
                                    top: `${location.coordinates.y}%`
                                }}
                                onClick={() => onLocationClick?.(location)}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="relative transition-transform hover:scale-110">
                                                {location.image ? (
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary overflow-hidden bg-background shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                                        <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <MapPin className="text-primary fill-primary w-8 h-8 md:w-10 md:h-10 drop-shadow-lg -mt-4 md:-mt-5" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{location.name}</p>
                                            {location.description && (
                                                <p className="text-xs max-w-[200px] line-clamp-3">{location.description}</p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
