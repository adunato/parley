"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface Coordinates {
    x: number;
    y: number;
}

interface WorldMapPickerProps {
    mapImage: string;
    initialCoordinates?: Coordinates;
    onCoordinatesChange: (coords: Coordinates) => void;
    className?: string;
    locationName?: string;
    locationImage?: string;
}

export function WorldMapPicker({
    mapImage,
    initialCoordinates,
    onCoordinatesChange,
    className,
    locationName = "Location",
    locationImage
}: WorldMapPickerProps) {
    const [coordinates, setCoordinates] = useState<Coordinates | undefined>(initialCoordinates);
    const [isHovered, setIsHovered] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        setCoordinates(initialCoordinates);
    }, [initialCoordinates]);

    const MapContent = ({ isExpanded = false }: { isExpanded?: boolean }) => {
        const containerRef = useRef<HTMLDivElement>(null);

        const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            const clampedX = Math.max(0, Math.min(100, x));
            const clampedY = Math.max(0, Math.min(100, y));

            const newCoords = { x: clampedX, y: clampedY };
            setCoordinates(newCoords);
            onCoordinatesChange(newCoords);

            // If in expanded mode, we might want to auto-close or just let user keep refining?
            // Let user keep refining.
        };

        return (
            <div
                ref={containerRef}
                className={cn(
                    "relative w-full bg-muted rounded-lg overflow-hidden cursor-crosshair border shadow-inner",
                    isExpanded ? "aspect-[21/9] h-[80vh]" : "aspect-video",
                    className
                )}
                onClick={handleMapClick}
                onMouseEnter={() => !isExpanded && setIsHovered(true)}
                onMouseLeave={() => !isExpanded && setIsHovered(false)}
            >
                {mapImage ? (
                    <img
                        src={mapImage}
                        alt="World Map"
                        className="w-full h-full object-contain pointer-events-none select-none"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No map image available
                    </div>
                )}

                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {coordinates && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out shadow-xl pointer-events-none"
                        style={{
                            left: `${coordinates.x}%`,
                            top: `${coordinates.y}%`
                        }}
                    >
                        <div className="relative group">
                            {/* In expanded mode, make the pin slightly larger? No, keep consistent relative size or fixed px? Fixed px is better for precision. */}
                            {locationImage ? (
                                <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden bg-background shadow-md">
                                    <img src={locationImage} alt={locationName} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <MapPin className="text-primary fill-primary w-8 h-8 drop-shadow-lg -mt-4" />
                            )}

                            <div className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/75 text-white text-xs rounded whitespace-nowrap",
                                isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100" // Always show label in expanded mode? Or standard hover.
                            )}>
                                {locationName}
                            </div>
                        </div>
                    </div>
                )}

                {/* Overlay for Expand Button (only in compact mode) */}
                {!isExpanded && isHovered && mapImage && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                        {/* Button itself needs pointer-events-auto */}
                        <div className="pointer-events-auto">
                            {/* This is handled by the DialogTrigger wrapping the whole thing or a specific button? 
                                A specific button is better for explicit action vs clicking to set point.
                                BUT user wants "pop out... when hovering".
                                So maybe the whole area becomes a trigger? 
                                No, that prevents clicking to set point in compact mode.
                                
                                Let's add a big centered button "Expand for Precision".
                            */}
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm" className="shadow-lg" onClick={(e) => {
                                    // Stop propagation so we don't set a point when clicking expand
                                    // Actually DialogTrigger handles the click, but we are inside the map div which has onClick.
                                    e.stopPropagation();
                                }}>
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    Expand for Precision
                                </Button>
                            </DialogTrigger>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                    {isExpanded ? "Click to set precise position" : "Click to set position"}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {/* 
                We render the compact map. 
                The "Expand" button inside it (via MapContent) will act as the Trigger.
                Wait, DialogTrigger must be a direct child of Dialog usually, or we can use controlled state.
                
                Actually, standard usage:
                <Dialog>
                   <DialogTrigger>Open</DialogTrigger>
                   <DialogContent>...</DialogContent>
                </Dialog>
                
                But my Trigger is conditionally rendered (on hover) inside MapContent.
                
                Better:
                Render MapContent.
                Wrap the "Expand" button component in DialogTrigger? Yes.
            */}
            <div className="w-full">
                <MapContent isExpanded={false} />
            </div>

            <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b bg-background z-10">
                    <DialogTitle>Set Location Position</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden bg-muted/20 relative flex items-center justify-center p-4">
                    {/* 
                        In expanded mode, we want the map to fit nicely but be large.
                        MapContent handles isExpanded logic.
                     */}
                    <MapContent isExpanded={true} />
                </div>
                <div className="p-4 border-t bg-background flex justify-end">
                    <Button onClick={() => setIsDialogOpen(false)}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
