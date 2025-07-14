"use client"

import { useState, useEffect } from "react";
import { Relationship } from "@/lib/store";
import { useParleyStore } from "@/lib/store";
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ChatComponent from "@/components/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RelationshipDisplay from "@/components/relationship-display";
import { CharacterTraitsDisplay } from "@/components/character-traits-display";
import { Sparkles, PlusCircle, CheckCircle } from "lucide-react";


export default function ChatPage() {
    const { characters, playerPersonas, setSelectedChatCharacter, setSelectedChatPersona, selectedChatCharacter, selectedChatPersona, clearChat, _hasHydrated, chatSessionId, updateCharacter } = useParleyStore();

    const [isChatActive, setIsChatActive] = useState(false);
    const [currentRelationship, setCurrentRelationship] = useState<Relationship | undefined>(undefined);
    const [latestDeltaDescription, setLatestDeltaDescription] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (_hasHydrated && selectedChatCharacter && selectedChatPersona) {
            const existingRelationship = selectedChatCharacter.relationships.find(rel => rel.personaAlias === selectedChatPersona.alias);
            if (existingRelationship) {
                setCurrentRelationship(existingRelationship);
            } else {
                setCurrentRelationship(undefined);
            }
        }
    }, [_hasHydrated, selectedChatCharacter, selectedChatPersona]);

    const handleCharacterSelect = (characterId: string) => {
        const character = characters.find(c => c.id === characterId);
        if (character) {
            setSelectedChatCharacter(character);
        }
    };

    const handlePersonaSelect = (personaAlias: string) => {
        const persona = playerPersonas.find(p => p.alias === personaAlias);
        if (persona) {
            setSelectedChatPersona(persona);
        }
    };

    const handleStartChat = async () => {
        if (selectedChatCharacter && selectedChatPersona) {
            const existingRelationship = selectedChatCharacter?.relationships.find(rel => rel.personaAlias === selectedChatPersona.alias);

            if (!existingRelationship) {
                try {
                    const response = await fetch('/api/generate/relationship', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            character: selectedChatCharacter,
                            persona: selectedChatPersona,
                        }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const newRelationship = { ...data.relationship, characterId: selectedChatCharacter.id, personaAlias: selectedChatPersona.alias };
                        const updatedCharacter = { ...selectedChatCharacter, relationships: [...selectedChatCharacter.relationships, newRelationship] };
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
            alert("Please select both a character and a persona to start the chat.");
        }
    };

    const handleEndChat = () => {
        if (selectedChatCharacter && selectedChatPersona && currentRelationship) {
            // No cumulative deltas to apply directly to the stored relationship
            // The relationship in the character object is updated directly by the onMessageFinish callback
            // TODO WE WILL NEED TO REFACTOR THIS AS WE LOST A FUNCTIONALITY HERE
        }
        clearChat();
        setLatestDeltaDescription(undefined);
        setIsChatActive(false);
    };

    const handleNewChat = () => {
        clearChat();
        setLatestDeltaDescription(undefined);
        setIsChatActive(false);
    };

    if (!_hasHydrated) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="mt-2 text-gray-600">Loading chat...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {!isChatActive ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900">Start a New Chat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label htmlFor="character-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Character
                                </label>
                                <Select onValueChange={handleCharacterSelect} value={selectedChatCharacter?.id || ""}>
                                    <SelectTrigger id="character-select">
                                        <SelectValue placeholder="Choose a character" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {characters.map((character) => (
                                            <SelectItem key={character.id} value={character.id}>
                                                {character.basicInfo.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="persona-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Persona
                                </label>
                                <Select onValueChange={handlePersonaSelect} value={selectedChatPersona?.alias || ""}>
                                    <SelectTrigger id="persona-select">
                                        <SelectValue placeholder="Choose a persona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {playerPersonas.map((persona) => (
                                            <SelectItem key={persona.alias} value={persona.alias}>
                                                {persona.name} ({persona.alias})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStartChat}
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                disabled={!selectedChatCharacter || !selectedChatPersona}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Start Chat
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex-1 flex justify-center p-4">
                    <div className="flex flex-col items-center w-full">
                        <div className="w-full mb-4 flex justify-end gap-2">
                            <Button onClick={handleEndChat} variant="outline">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                End Chat
                            </Button>
                            <Button onClick={handleNewChat} variant="outline">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                        <div className="flex flex-row items-start w-full justify-center gap-4 max-w-screen-2xl">
                            {selectedChatCharacter && (
                                <CharacterTraitsDisplay
                                    personality={selectedChatCharacter.personality}
                                    likes={selectedChatCharacter.preferences?.attractedToTraits || []}
                                    dislikes={selectedChatCharacter.preferences?.dislikesTraits || []}
                                />
                            )}
                            <ChatComponent
                                chatSessionId={chatSessionId}
                                className="flex-grow"
                                relationship={currentRelationship}
                                onMessageFinish={async (message, fullMessages) => {
                                    if (selectedChatCharacter && selectedChatPersona && currentRelationship) {
                                        const latestExchange = {
                                            userMessage: fullMessages[fullMessages.length - 2]?.content || "",
                                            characterResponse: message.content,
                                        };

                                        try {
                                            const response = await fetch('/api/generate/relationship-delta', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    character: selectedChatCharacter,
                                                    persona: selectedChatPersona,
                                                    chatHistory: fullMessages,
                                                    latestExchange,
                                                    currentRelationship,
                                                }),
                                            });
                                            const data = await response.json();
                                            if (response.ok && data.relationshipDelta) {
                                                
                                                setLatestDeltaDescription(data.relationshipDelta.description);
                                            } else {
                                                console.error('Failed to generate relationship delta:', data.error);
                                            }
                                        } catch (error) {
                                            console.error('Error generating relationship delta:', error);
                                        }
                                    }
                                }}
                            />
                            {currentRelationship && selectedChatCharacter && (
                                <RelationshipDisplay
                                    characterName={selectedChatCharacter.basicInfo.name}
                                    relationship={currentRelationship}
                                    
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
