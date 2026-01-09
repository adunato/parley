import React, { useRef, useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const containerRef = useRef<HTMLDivElement>(null);
    const [coordinates, setCoordinates] = useState<Coordinates | undefined>(initialCoordinates);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setCoordinates(initialCoordinates);
    }, [initialCoordinates]);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        // If dragging, we handle in handleMouseMove/Up, but for simple click to move:
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp to 0-100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        const newCoords = { x: clampedX, y: clampedY };
        setCoordinates(newCoords);
        onCoordinatesChange(newCoords);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent map click from triggering if we are starting drag on pin, 
        // but if clicking empty space, we want to set connection.
        // For simplicity, click anywhere sets it.
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full aspect-video bg-muted rounded-lg overflow-hidden cursor-crosshair border shadow-inner", className)}
            onClick={handleMapClick}
        >
            {mapImage ? (
                <img
                    src={mapImage}
                    alt="World Map"
                    className="w-full h-full object-cover pointer-events-none select-none"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No map image available
                </div>
            )}

            {/* Grid overlay for reference (optional, keep subtle) */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {coordinates && (
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out shadow-xl"
                    style={{
                        left: `${coordinates.x}%`,
                        top: `${coordinates.y}%`
                    }}
                >
                    <div className="relative group">
                        {locationImage ? (
                            <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden bg-background shadow-md group-hover:scale-110 transition-transform">
                                <img src={locationImage} alt={locationName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <MapPin className="text-primary fill-primary w-8 h-8 drop-shadow-lg group-hover:scale-110 transition-transform -mt-4" />
                        )}

                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/75 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                            {locationName}
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                Click to set position
            </div>
        </div>
    );
}
