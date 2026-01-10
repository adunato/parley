import { Location } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEntityStore } from '@/lib/entityStore';
import { useGameStore } from '@/lib/store/gameStore';

interface LocationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    location: Location | null;
}

export function LocationPopup({ isOpen, onClose, location }: LocationPopupProps) {
    const router = useRouter();
    const gameCharacters = useGameStore(state => state.characters);
    const entityCharacters = useEntityStore(state => state.characters);

    // Fallback logic similar to WorldMapPage
    const characters = (gameCharacters && gameCharacters.length > 0) ? gameCharacters : entityCharacters;

    if (!location) return null;

    // Filter characters and sync avatars from EntityStore (Config) to ensure visuals are up to date even in Game State
    const locationCharacters = characters
        .filter(c => c.locationId === location.id)
        .map(char => {
            const configChar = entityCharacters.find(ec => ec.id === char.id);
            if (configChar && configChar.basicInfo.avatar) {
                return {
                    ...char,
                    basicInfo: {
                        ...char.basicInfo,
                        avatar: configChar.basicInfo.avatar
                    }
                };
            }
            return char;
        });

    const handleVisit = () => {
        router.push(`/location/${location.id}`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {location.image ? (
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarImage src={location.image} alt={location.name} className="object-cover" />
                                <AvatarFallback><MapPin className="w-6 h-6" /></AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                        )}
                        <DialogTitle className="type-h3">{location.name}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <DialogDescription className="text-base line-clamp-4">
                        {location.description}
                    </DialogDescription>

                    {locationCharacters.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Characters Here ({locationCharacters.length})
                            </h4>
                            <div className="flex -space-x-2">
                                {locationCharacters.slice(0, 5).map(char => (
                                    <Avatar key={char.id} className="border-2 border-background w-8 h-8">
                                        <AvatarImage src={char.basicInfo.avatar} />
                                        <AvatarFallback className="text-xs">{char.basicInfo.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {locationCharacters.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                        +{locationCharacters.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 sm:justify-start">
                    <Button onClick={handleVisit} className="w-full sm:w-auto">
                        Visit Location
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
