import { Persona } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PersonaCard } from "./persona-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";

interface PersonaSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    personas: Persona[];
    onSelect: (persona: Persona) => void;
}

export function PersonaSelectionDialog({ open, onOpenChange, personas, onSelect }: PersonaSelectionDialogProps) {
    const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedPersonaId) {
            const persona = personas.find(p => p.id === selectedPersonaId);
            if (persona) {
                onSelect(persona);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="text-center sm:text-center mb-4">
                    <DialogTitle className="text-3xl font-display uppercase tracking-widest text-primary">Select Your Persona</DialogTitle>
                    <DialogDescription className="font-sans text-lg">
                        Choose who you will be in this story.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="w-full overflow-x-auto whitespace-nowrap rounded-md border bg-secondary/20 p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <div className="flex w-max space-x-4 p-4 min-w-full">
                            {personas.map((persona) => (
                                <PersonaCard
                                    key={persona.id}
                                    persona={persona}
                                    isSelected={selectedPersonaId === persona.id}
                                    onClick={() => setSelectedPersonaId(persona.id)}
                                    className="shrink-0"
                                />
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
                        disabled={!selectedPersonaId}
                        className="px-8 font-bold tracking-wider font-display uppercase"
                    >
                        <Check className="mr-2 h-4 w-4" /> Start Game
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
