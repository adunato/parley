"use client"

import { useState } from "react";
import { useParleyStore } from "@/lib/store";
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ChatComponent from "@/components/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, PlusCircle } from "lucide-react";

export default function ChatPage() {
    const { characters, playerPersonas, setSelectedChatCharacter, setSelectedChatPersona, selectedChatCharacter, selectedChatPersona, clearChat, _hasHydrated, chatSessionId, chatMessages } = useParleyStore();

    const [isChatActive, setIsChatActive] = useState(false);

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

    const handleStartChat = () => {
        if (selectedChatCharacter && selectedChatPersona) {
            setIsChatActive(true);
        } else {
            alert("Please select both a character and a persona to start the chat.");
        }
    };

    const handleNewChat = () => {
        clearChat();
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
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl mb-4 flex justify-end">
                        <Button onClick={handleNewChat} variant="outline">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            New Chat
                        </Button>
                    </div>
                    <ChatComponent chatSessionId={chatSessionId} className="w-full max-w-2xl" />
                </div>
            )}
        </div>
    );
}
