"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Relationship } from "@/lib/types";
import { useParleyStore } from "@/lib/store";
import { useGameStore } from "@/lib/store/gameStore"; // New import
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ChatComponent from "@/components/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RelationshipDisplay from "@/components/relationship-display";
import { CharacterTraitsDisplay } from "@/components/character-traits-display";
import { SceneSummaryModal } from "@/components/scene-summary-modal";
import { Sparkles, PlusCircle, CheckCircle } from "lucide-react";
// import { useEntityStore } from "@/lib/entityStore"; // REMOVED
import { PRQC } from "@/lib/types";
import { GameplayToolbar } from "@/components/gameplay-toolbar"; // Integrated Toolbar


export default function ChatPage() {
    const router = useRouter();

    const {
        // clearChat, // Moving clearChat to gameStore
        _hasHydrated,
        chatSessionId,
        // chatMessages, // Moving to gameStore
        worldDescription,
        aiStyle,
        chatModel,
        summarizationModel,
        generationModel
    } = useParleyStore();

    const {
        characters,
        playerPersonas,
        locations,

        currentCharacterId,
        setCurrentCharacterId,

        currentPersonaId,
        setCurrentPersonaId,

        currentLocationId,
        setCurrentLocationId,

        updateCharacter,

        chatMessages,
        setChatMessages,
        clearChat,

        cumulativeRelationshipDelta,
        updateCumulativeRelationshipDelta,
        clearCumulativeRelationshipDelta,
    } = useGameStore();

    // Derived selection objects
    // Note: If IDs are null, finds will return undefined, which matches previous behavior
    const selectedChatCharacter = characters.find(c => c.id === currentCharacterId);
    const selectedChatPersona = playerPersonas.find(p => p.id === currentPersonaId);
    const selectedChatLocation = locations.find(l => l.id === currentLocationId);

    // Wrapper setters to match previous API logic if strictly needed, or update usage below.
    // Ideally update usage.
    const setSelectedChatLocation = (loc: any) => setCurrentLocationId(loc?.id || null);
    const setSelectedChatCharacter = (char: any) => setCurrentCharacterId(char?.id || null);
    const setSelectedChatPersona = (p: any) => setCurrentPersonaId(p?.id || null);

    const [isChatActive, setIsChatActive] = useState(false);
    const [currentRelationship, setCurrentRelationship] = useState<Relationship | undefined>(undefined);

    // Phase 7: Scene Summary State
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [sceneDelta, setSceneDelta] = useState<PRQC | null>(null);
    const [sceneAnalysisDescription, setSceneAnalysisDescription] = useState<string | null>(null);
    const [sceneAppliedTraits, setSceneAppliedTraits] = useState<string[]>([]);
    const [sceneSummaryText, setSceneSummaryText] = useState<string | null>(null);

    // Auto-start chat if all parameters are present (e.g. from Location Screen or Character Card)
    useEffect(() => {
        if (!isChatActive && _hasHydrated) {
            if (currentCharacterId && currentPersonaId && currentLocationId) {
                // We have all context, attempt to start chat automatically
                // We reuse the logic from handleStartChat but need to avoid calling it if it's not stable.
                // Best to extract the logic or call it here.

                // Note: handleStartChat relies on selectedChatCharacter derived from currentCharacterId, etc.
                // We need to wait for render cycle or just call it? 
                // Since this effect runs on hydration and ID changes, selectedChatCharacter *should* be valid if currentCharacterId is set.
                handleStartChat();
            }
        }
    }, [_hasHydrated, currentCharacterId, currentPersonaId, currentLocationId, isChatActive]); // Add dependencies carefully

    const handleLocationSelect = (locationId: string) => {
        if (locationId === "unassigned") {
            setSelectedChatLocation(undefined);
        } else {
            const location = locations.find(l => l.id === locationId);
            setSelectedChatLocation(location);
        }
        // Create a synthetic event or just clear selected character when location changes
        setSelectedChatCharacter(undefined);
    };

    const filteredCharacters = characters.filter(c => {
        if (!selectedChatLocation) {
            // Requirement: "Location should be provided... select a location first... then available characters".
            // However, legacy characters have no location.
            // If explicit "Unassigned" is selected (represented by undefined/null selectedChatLocation but triggered by user?), 
            // OR if we treat "Select Location" as mandatory.
            // Let's implement: Default view shows 'Unassigned' or we force selection?
            // HLD says: "must now select a location first". 
            // So if no location selected (or "Unassigned" selected), show characters with no location.
            // But usually "Unassigned" is a specific choice.
            // Let's assume if selectedChatLocation is undefined, we show characters with no location ID.
            return !c.locationId;
        }
        return c.locationId === selectedChatLocation.id;
    });

    const handleCharacterSelect = (characterId: string) => {
        const character = characters.find(c => c.id === characterId);
        if (character) {
            setSelectedChatCharacter(character);
        } else {
            console.error('No character found with ID:', characterId);
        }
    };

    const handlePersonaSelect = (personaId: string) => {
        const persona = playerPersonas.find(p => p.id === personaId);
        if (persona) {
            setSelectedChatPersona(persona);
        } else {
            console.error('No persona found with ID:', personaId);
        }
    };

    // Wrapped in useCallback for dependency array stability
    const handleStartChat = useCallback(async () => {
        if (selectedChatCharacter && selectedChatPersona) {
            // Always get the latest character data from the store
            const characterFromStore = characters.find(c => c.id === selectedChatCharacter.id);
            if (!characterFromStore) {
                console.error("Selected character not found in the main characters list.");
                alert("An error occurred. Could not find the selected character.");
                return;
            }

            const existingRelationship = characterFromStore.relationships.find(rel => rel.personaId === selectedChatPersona.id);

            if (!existingRelationship) {
                try {
                    const response = await fetch('/api/generate/relationship', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            character: characterFromStore, // Use the latest character data
                            persona: selectedChatPersona,
                            worldDescription,
                            aiStyle,
                            generationModel,
                            locationDescription: selectedChatLocation?.description
                        }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const newRelationship = { ...data.relationship, characterId: characterFromStore.id, personaId: selectedChatPersona.id };
                        const updatedCharacter = { ...characterFromStore, relationships: [...characterFromStore.relationships, newRelationship] };
                        updateCharacter(updatedCharacter);
                        setCurrentRelationship(newRelationship);
                    } else {
                        console.error('Failed to generate relationship:', data.error);
                        alert('Error generating relationship: ' + data.error);
                        return; // Prevent chat from starting if relationship generation fails
                    }
                } catch (error) {
                    console.error('Error generating relationship:', error);
                    alert('An unexpected error occurred while generating the relationship.');
                    return; // Prevent chat from starting if relationship generation fails
                }
            } else {
                setCurrentRelationship(existingRelationship);
            }
            setIsChatActive(true);
        } else {
            // If we are auto-starting, this alert might be annoying if transient state causes it. 
            // But if we have IDs, we should have objects.
            // alert("Please select both a character and a persona to start the chat.");
        }
    }, [selectedChatCharacter, selectedChatPersona, characters, worldDescription, aiStyle, generationModel, selectedChatLocation, updateCharacter]);

    const handleEndChat = async () => {
        if (selectedChatCharacter && selectedChatPersona && currentRelationship) {

            // 1. Open Modal and Start Loading
            setIsSummaryModalOpen(true);
            setIsLoadingSummary(true);

            // 2. Run Analyst (Process Turn / Scene)
            let analysisResult: { delta: PRQC, description: string } | null = null;
            try {
                const response = await fetch('/api/engine/process-scene', { // UPDATED ENDPOINT
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatHistory: chatMessages,
                        character: selectedChatCharacter,
                        persona: selectedChatPersona,
                        currentRelationship: currentRelationship,
                        modelName: generationModel
                    }),
                });
                const data = await response.json();
                if (response.ok && data.delta) {
                    analysisResult = { delta: data.delta, description: data.description };
                    setSceneDelta(data.delta);
                    setSceneAnalysisDescription(data.description);
                    setSceneAppliedTraits(data.applied_traits || []); // Capture Traits
                }
            } catch (error) {
                console.error("Error running Analyst:", error);
            }

            // 3. Generate Summary
            try {
                const response = await fetch('/api/summarise', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatHistory: chatMessages,
                        worldInfo: worldDescription,
                        aiStyle: aiStyle,
                        characterName: selectedChatCharacter?.basicInfo?.name || "Unknown Character",
                        playerPersonaName: selectedChatPersona?.basicInfo?.name || "Unknown Persona",
                        summarizationModel: summarizationModel,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    setSceneSummaryText(data.summary);
                }
            } catch (error) {
                console.error("Error generating summary:", error);
            }

            // 4. Finish Loading
            setIsLoadingSummary(false);
        }
    };

    const handleCloseSummary = () => {
        if (selectedChatCharacter && selectedChatPersona && sceneSummaryText) {
            const newSummary = { summary: sceneSummaryText, timestamp: new Date() };

            const updatedRelationships = selectedChatCharacter.relationships.map(rel => {
                if (rel.personaId === selectedChatPersona.id) {
                    // Add Summary
                    const existingSummaries = rel.chat_summaries || [];
                    const updatedSummaries = [...existingSummaries, newSummary];

                    // Apply Delta (if exists)
                    if (sceneDelta) {
                        return {
                            ...rel,
                            satisfaction: Math.max(0, Math.min(100, rel.satisfaction + (sceneDelta.satisfaction || 0))),
                            commitment: Math.max(0, Math.min(100, rel.commitment + (sceneDelta.commitment || 0))),
                            intimacy: Math.max(0, Math.min(100, rel.intimacy + (sceneDelta.intimacy || 0))),
                            trust: Math.max(0, Math.min(100, rel.trust + (sceneDelta.trust || 0))),
                            passion: Math.max(0, Math.min(100, rel.passion + (sceneDelta.passion || 0))),
                            chat_summaries: updatedSummaries
                        };
                    }

                    return {
                        ...rel,
                        chat_summaries: updatedSummaries
                    };
                }
                return rel;
            });

            const updatedCharacter = {
                ...selectedChatCharacter,
                relationships: updatedRelationships
            };

            updateCharacter(updatedCharacter);

            // Update local state to reflect changes immediately if needed, though clearChat usually resets UI
            const newRel = updatedRelationships.find(r => r.personaId === selectedChatPersona.id);
            if (newRel) setCurrentRelationship(newRel);
        }

        setIsSummaryModalOpen(false);
        setSceneDelta(null);
        setSceneAnalysisDescription(null);
        setSceneAppliedTraits([]);
        setSceneSummaryText(null);

        clearCumulativeRelationshipDelta(); // Just in case
        clearChat();
        setIsChatActive(false);
        router.push('/world_map');
    };

    const handleNewChat = () => {
        clearCumulativeRelationshipDelta(); // Fixed duplicate call
        clearChat();
        setIsChatActive(false);
    };

    const handleExitGame = () => {
        // Functionality for Exit icon in toolbar
        // Matches handleEndChat logic but maybe without summary if triggered abruptly? 
        // Or simply routes to Home.
        // Requested behavior: "Exit icon (which goes back to the main menu)"
        // Safest is to route to /
        router.push('/');
    };

    const handleOpenSettings = () => {
        // Placeholder for Settings icon
        console.log("Settings clicked");
        // Could open a modal or route to settings
        router.push('/settings');
    };

    if (!_hasHydrated) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading chat...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {isChatActive && (
                <GameplayToolbar
                    currentDay={1} // Placeholder for Day, needing GameState integration later
                    timeOfDay={"Morning"} // Placeholder for Time, needing GameState integration later
                    personaName={selectedChatPersona?.basicInfo?.name}
                    // personaImageSrc={selectedChatPersona?.avatar} // Assuming avatar exists or undefined
                    onExitGame={handleExitGame}
                    onOpenSettings={handleOpenSettings}
                />
            )}
            {!isChatActive ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    {(currentCharacterId && currentPersonaId && currentLocationId) ? (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <h2 className="type-h3 animate-pulse">Entering Chat...</h2>
                        </div>
                    ) : (
                        <Card className="w-full max-w-md border-border shadow-lg">
                            <CardHeader className="border-b border-border mb-4">
                                <CardTitle className="type-h3">Start a New Chat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label htmlFor="location-select" className="type-ui-label text-muted-foreground mb-2 block">
                                        Select Location
                                    </label>
                                    <Select onValueChange={handleLocationSelect} value={selectedChatLocation?.id || "unassigned"}>
                                        <SelectTrigger id="location-select">
                                            <SelectValue placeholder="Choose a location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned / No Location</SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label htmlFor="character-select" className="type-ui-label text-muted-foreground mb-2 block">
                                        Select Character
                                    </label>
                                    <Select onValueChange={handleCharacterSelect} value={selectedChatCharacter?.id || ""}>
                                        <SelectTrigger id="character-select">
                                            <SelectValue placeholder="Choose a character" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCharacters.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground">No characters in this location</div>
                                            ) : (
                                                filteredCharacters.map((character) => (
                                                    <SelectItem key={character.id} value={character.id}>
                                                        {character.basicInfo.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label htmlFor="persona-select" className="type-ui-label text-muted-foreground mb-2 block">
                                        Select Persona
                                    </label>
                                    <Select onValueChange={handlePersonaSelect} value={selectedChatPersona?.id || ""}>
                                        <SelectTrigger id="persona-select">
                                            <SelectValue placeholder="Choose a persona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {playerPersonas.map((persona) => (
                                                <SelectItem key={persona.id} value={persona.id}>
                                                    {persona.basicInfo.name} ({persona.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleStartChat}
                                    className="w-full py-2 px-4 shadow-md type-ui-label"
                                    disabled={!selectedChatCharacter || !selectedChatPersona}
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start Chat
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex justify-center p-4">
                    <div className="flex flex-col items-center w-full">
                        {/* 
                            Toolbar replaces these buttons in Play Mode. 
                            If explicitly wanting "New Chat", it might need to be in Toolbar or Menu.
                            For now, relying on Toolbar Exit to go to Menu -> New Game.
                        */}
                        {/* <div className="w-full mb-4 flex justify-end gap-2">
                             <Button onClick={handleEndChat} variant="outline">
                                 <CheckCircle className="w-4 h-4 mr-2" />
                                 End Chat
                             </Button>
                             <Button onClick={handleNewChat} variant="outline">
                                 <PlusCircle className="w-4 h-4 mr-2" />
                                 New Chat
                             </Button>
                         </div> */}
                        <div className="flex flex-row items-start w-full justify-center gap-4 max-w-screen-2xl">
                            {selectedChatCharacter && (
                                <CharacterTraitsDisplay
                                    personality={selectedChatCharacter.personality}
                                    idealMatch={selectedChatCharacter.idealMatch || { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 }}
                                />
                            )}
                            <ChatComponent
                                chatSessionId={chatSessionId} // Keeps relying on global session ID for now? Or switch to gameStore ID? Keeping for now to minimize diff.
                                className="flex-grow"
                                relationship={currentRelationship}
                            // Need to pass messages and setMessages to ChatComponent if it relies on store or props?
                            // ChatComponent likely uses useParleyStore internally. We need to check ChatComponent.
                            />
                            {currentRelationship && selectedChatCharacter && (
                                <RelationshipDisplay
                                    characterName={selectedChatCharacter.basicInfo.name}
                                    relationship={currentRelationship}
                                    cumulativeDeltaRelationship={cumulativeRelationshipDelta}

                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <SceneSummaryModal
                isOpen={isSummaryModalOpen}
                isLoading={isLoadingSummary}
                onClose={handleCloseSummary}
                relationshipDelta={sceneDelta}
                analysisDescription={sceneAnalysisDescription}
                sceneSummary={sceneSummaryText}
                appliedTraits={sceneAppliedTraits}
            />
        </div>
    );
}
