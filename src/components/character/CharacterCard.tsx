import { Character } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { RelationshipBar } from "./RelationshipBar";
import { useGameStore } from "@/lib/store/gameStore";
import { useRouter } from "next/navigation";

interface CharacterCardProps {
    character: Character;
    locationId?: string; // Optional context if we know where they are
}

export function CharacterCard({ character, locationId }: CharacterCardProps) {
    const router = useRouter();
    const {
        setCurrentCharacterId,
        setCurrentLocationId,
        setCurrentPlayerCharacterId,
        characters
    } = useGameStore();

    const handleChat = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling if card is clickable

        // 1. Set Character
        setCurrentCharacterId(character.id);

        // 2. Set Location (if provided, otherwise use character's location)
        if (locationId) {
            setCurrentLocationId(locationId);
        } else if (character.locationId) {
            setCurrentLocationId(character.locationId);
        }

        // 3. Ensure a Persona is select (default to first if none or invalid)
        // This is a simple heuristic; ideally user selects persona, but for quick chat we might need to assume or prompt.
        // Current logic in ChatPage requires selection.
        // Check if we have a current player character set, if not set it to the first one
        const state = useGameStore.getState();
        if (!state.currentPlayerCharacterId && characters.length > 0) {
            setCurrentPlayerCharacterId(characters[0].id);
        }

        // 4. Navigate
        router.push('/chat');
    };

    // Find active relationship with current persona if available? 
    // Since we don't know which persona is "active" until chat, we might show the relationship with the *default* or *last used* persona,
    // or aggregate?
    // Requirement says: "A new relationship bar component... calculate... Logic to ensure all relationship traits are summarised".
    // Relationships are per-persona. 
    // Let's grab the relationship for the CURRENTLY SELECTED persona in the store, if any.
    const state = useGameStore.getState();
    const currentPlayerCharacterId = state.currentPlayerCharacterId || (characters.length > 0 ? characters[0].id : null);

    const relationship = currentPlayerCharacterId
        ? character.relationships.find(r => r.targetId === currentPlayerCharacterId && r.type === 'character')
        : undefined;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={character.basicInfo.avatar} alt={character.basicInfo.name} className="object-cover" />
                        <AvatarFallback className="text-lg font-display">{character.basicInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="type-h4 truncate text-base leading-tight">{character.basicInfo.name}</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">
                                    {character.basicInfo.role} • {character.basicInfo.age} yrs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <RelationshipBar relationship={relationship} />

                    <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={handleChat}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
