import { Character } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CharacterTraitsDisplay } from "./character-traits-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, ChevronLeft, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CharacterSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    characters: Character[];
    households: import('@/lib/types').Household[];
    onSelect: (character: Character) => void;
}

export function CharacterSelectionDialog({ open, onOpenChange, characters, households, onSelect }: CharacterSelectionDialogProps) {
    const [step, setStep] = useState<'household' | 'character'>('household');
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    // Reset state when opening
    if (open && step === 'character' && !selectedHouseholdId) {
        setStep('household');
        setSelectedHouseholdId(null);
        setSelectedCharacterId(null);
    }

    const handleConfirm = () => {
        if (selectedCharacterId) {
            const character = characters.find(c => c.id === selectedCharacterId);
            if (character) {
                onSelect(character);
                // Reset for next open
                setStep('household');
                setSelectedHouseholdId(null);
                setSelectedCharacterId(null);
            }
        }
    };

    const handleBack = () => {
        setStep('household');
        setSelectedCharacterId(null);
    };

    const filteredCharacters = characters.filter(c => !c.isPlaceholder && c.householdId === selectedHouseholdId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="text-center sm:text-center mb-4">
                    <DialogTitle className="text-3xl font-display uppercase tracking-widest text-primary">
                        {step === 'household' ? 'Select Household' : 'Select Your Character'}
                    </DialogTitle>
                    <DialogDescription className="font-sans text-lg">
                        {step === 'household' ? 'Choose the household you wish to play as.' : 'Choose who you will be in this story.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex-1 min-h-0">
                    {step === 'household' ? (
                        <div className="w-full h-full overflow-y-auto rounded-md border bg-secondary/20 p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {households.map((household) => {
                                    const members = characters.filter(c => household.characters.includes(c.id));
                                    return (
                                        <div
                                            key={household.id}
                                            onClick={() => {
                                                setSelectedHouseholdId(household.id);
                                                setStep('character');
                                            }}
                                            className={`cursor-pointer overflow-hidden rounded-md border-2 p-4 transition-all flex flex-col items-center bg-background hover:border-primary/50`}
                                        >
                                            <div className="h-16 w-16 mb-4 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                                <Home className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="font-semibold text-lg text-center mb-2">{household.name}</h3>
                                            <div className="w-full text-sm text-center mb-4 text-muted-foreground line-clamp-2">
                                                {household.description || "No description provided."}
                                            </div>
                                            <div className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-wider mt-auto">
                                                {members.length} member{members.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                                {households.length === 0 && (
                                     <div className="col-span-full text-center p-8 text-muted-foreground">
                                         No households found. Please configure them first.
                                     </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-x-auto whitespace-nowrap rounded-md border bg-secondary/20 p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            <div className="flex w-max space-x-4 p-4 min-w-full">
                                {filteredCharacters.map((character) => (
                                    <div
                                        key={character.id}
                                        onClick={() => setSelectedCharacterId(character.id)}
                                        className={`shrink-0 cursor-pointer overflow-hidden rounded-md border-2 p-4 transition-all w-80 flex flex-col items-center
                                                ${selectedCharacterId === character.id ? "border-primary bg-primary/5" : "border-transparent bg-background hover:border-primary/50"}`}
                                    >
                                        <Avatar className="h-24 w-24 mb-4">
                                            <AvatarImage src={character.basicInfo.avatar} alt={character.basicInfo.name} />
                                            <AvatarFallback className="text-2xl">{character.basicInfo.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-semibold text-lg text-center mb-2">{character.basicInfo.name}</h3>
                                        <div className="w-full text-sm text-center mb-4 text-muted-foreground whitespace-normal line-clamp-3">
                                            {character.basicInfo.background}
                                        </div>
                                        <div className="w-full">
                                            <CharacterTraitsDisplay personality={character.personality} showIdealMatch={false} showHeading={false} />
                                        </div>
                                    </div>
                                ))}
                                {filteredCharacters.length === 0 && (
                                    <div className="w-full text-center p-8 text-muted-foreground">
                                        No playable characters available in this household.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div>
                        {step === 'character' && (
                            <Button variant="ghost" onClick={handleBack}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Households
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={step === 'household' || !selectedCharacterId}
                            className="px-8 font-bold tracking-wider font-display uppercase"
                        >
                            <Check className="mr-2 h-4 w-4" /> Start Game
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
