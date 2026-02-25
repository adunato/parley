import { Character } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CharacterTraitsDisplay } from "./character-traits-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CharacterSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    characters: Character[];
    onSelect: (character: Character) => void;
}

export function CharacterSelectionDialog({ open, onOpenChange, characters, onSelect }: CharacterSelectionDialogProps) {
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedCharacterId) {
            const character = characters.find(c => c.id === selectedCharacterId);
            if (character) {
                onSelect(character);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="text-center sm:text-center mb-4">
                    <DialogTitle className="text-3xl font-display uppercase tracking-widest text-primary">Select Your Character</DialogTitle>
                    <DialogDescription className="font-sans text-lg">
                        Choose who you will be in this story.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="w-full overflow-x-auto whitespace-nowrap rounded-md border bg-secondary/20 p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <div className="flex w-max space-x-4 p-4 min-w-full">
                            {characters.map((character) => (
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
                                    <div className="w-full">
                                        <CharacterTraitsDisplay personality={character.personality} idealMatch={character.idealMatch} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedCharacterId}
                        className="px-8 font-bold tracking-wider font-display uppercase"
                    >
                        <Check className="mr-2 h-4 w-4" /> Start Game
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
