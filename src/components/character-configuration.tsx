import { useParleyStore, Character, PlayerPersona } from "@/lib/store"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Save, Plus, Book, Brain, Heart, Settings, Sparkles, Type } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CharacterConfiguration() {
    const { characters, addCharacter, updateCharacter, deleteCharacter, addPlayerPersona, worldDescription, aiStyle, _hasHydrated, relationships, addRelationship, updateRelationship, selectedChatPersona } = useParleyStore()
    const [selectedId, setSelectedId] = useState<string | null>(characters[0]?.id || null)
    const [editedCharacter, setEditedCharacter] = useState<Character | null>(null)
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
    const [isCharacterPromptDialogOpen, setIsCharacterPromptDialogOpen] = useState(false);
    const [dialogCharacterPrompt, setDialogCharacterPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const selectedCharacter = characters.find((c) => c.id === selectedId)

    const handleSelect = (character: Character) => {
        setSelectedId(character.id)
        setEditedCharacter({ ...character })
        setIsEditing(false);
    }

    const handleSave = () => {
        if (editedCharacter) {
            if (characters.some(c => c.id === editedCharacter.id)) {
                updateCharacter(editedCharacter)
            } else {
                addCharacter({ ...editedCharacter, id: editedCharacter.id || (characters.length > 0 ? (parseInt(characters[characters.length - 1].id) + 1) : 1).toString() })
            }
            setEditedCharacter(null)
            setIsEditing(false);
        }
    }

    const handleCancel = () => {
        setEditedCharacter(null)
        setIsEditing(false);
    }

    const handleInputChange = (
        section: keyof Character | "basicInfo" | "personality" | "preferences",
        field: string,
        value: string | number | string[] | undefined
    ) => {
        if (editedCharacter) {
            setEditedCharacter((prev) => {
                if (!prev) return null

                const newCharacter = { ...prev }

                if (section === "basicInfo" || section === "personality" || section === "relationshipToPlayer" || section === "preferences") {
                    newCharacter[section] = {
                        ...newCharacter[section],
                        [field]: value,
                    } as any // Type assertion for nested objects
                } else {
                    (newCharacter as any)[field] = value // For top-level fields if any
                }
                return newCharacter
            })
        }
    }

    const handleAddCharacter = () => {
        const newId = (characters.length > 0 ? (parseInt(characters[characters.length - 1].id) + 1) : 1).toString()
        const newCharacter: Character = {
            id: newId,
            basicInfo: { name: "New Character" },
            personality: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
            preferences: { attractedToTraits: [], dislikesTraits: [], gossipTendency: "low" },
        }
        addCharacter(newCharacter)
        setSelectedId(newId)
        setEditedCharacter(newCharacter)
        setIsEditing(true);
    }

    const handleDeleteCharacter = () => {
        if (editedCharacter && editedCharacter.id) {
            deleteCharacter(editedCharacter.id)
            setEditedCharacter(null)
            setSelectedId(characters[0]?.id || null)
            setIsEditing(false);
        }
    }

    const displayCharacter = editedCharacter || selectedCharacter

    const handleConvertToPersona = () => {
        if (displayCharacter) {
            const newPersona: PlayerPersona = {
                name: displayCharacter.basicInfo.name,
                alias: displayCharacter.basicInfo.name.replace(/\s/g, '') + '-persona',
                reputation: displayCharacter.basicInfo.reputation || '',
                background: displayCharacter.basicInfo.background || '',
                firstImpression: displayCharacter.basicInfo.firstImpression || '',
                role: displayCharacter.basicInfo.role || '',
                faction: displayCharacter.basicInfo.faction || '',
                avatar: displayCharacter.basicInfo.avatar || '',
                appearance: displayCharacter.basicInfo.appearance || '',
            };
            addPlayerPersona(newPersona);
            alert(`Converted ${newPersona.name} to a new persona: ${newPersona.alias}`);
        }
    };

    const generateCharacter = async (prompt: string) => {
        setIsGeneratingCharacter(true);
        try {
            const body: { characterDescription?: string; worldDescription?: string; aiStyle?: string } = {};
            if (prompt !== undefined && prompt !== '') {
                body.characterDescription = prompt;
            }
            if (_hasHydrated && worldDescription) {
                body.worldDescription = worldDescription;
            }
            if (_hasHydrated && aiStyle) {
                body.aiStyle = aiStyle;
            }
            const response = await fetch('/api/generate/character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                const generatedCharacterData = {
                    ...data.character,
                    personality: {
                        openness: data.character.personality.openness || 0,
                        conscientiousness: data.character.personality.conscientiousness || 0,
                        extraversion: data.character.personality.extraversion || 0,
                        agreeableness: data.character.personality.agreeableness || 0,
                        neuroticism: data.character.personality.neuroticism || 0,
                    },
                    
                    preferences: {
                        attractedToTraits: data.character.preferences?.attractedToTraits || [],
                        dislikesTraits: data.character.preferences?.dislikesTraits || [],
                        gossipTendency: data.character.preferences?.gossipTendency || "low",
                    },
                };

                if (selectedId && selectedCharacter) {
                    // Overwrite the currently selected character
                    const updatedCharacter = { ...selectedCharacter, ...generatedCharacterData, id: selectedId };
                    updateCharacter(updatedCharacter);
                    setSelectedId(updatedCharacter.id);
                    setEditedCharacter(updatedCharacter);
                } else {
                    // Add as a new character
                    const newId = (characters.length > 0 ? (parseInt(characters[characters.length - 1].id) + 1) : 1).toString();
                    const newCharacter = { id: newId, ...generatedCharacterData };
                    addCharacter(newCharacter);
                    setSelectedId(newCharacter.id);
                    setEditedCharacter(newCharacter);
                }
            } else {
                console.error('Failed to generate character:', data.error);
                alert('Error generating character: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating character:', error);
            alert('An unexpected error occurred while generating the character.');
        } finally {
            setIsGeneratingCharacter(false);
            setIsCharacterPromptDialogOpen(false);
            setDialogCharacterPrompt('');
        }
    };

    const handleGenerateCharacter = () => {
        generateCharacter("");
    };

    const handleGenerateCharacterWithPrompt = () => {
        generateCharacter(dialogCharacterPrompt);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar - Master List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Characters</h2>
                        <Button size="sm" variant="outline" onClick={handleAddCharacter}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{characters.length} characters</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {characters.map((character) => (
                        <div
                            key={character.id}
                            onClick={() => handleSelect(character)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedId === character.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <h3 className="font-medium text-gray-900 truncate">{character.basicInfo.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{character.basicInfo.role}</p>
                                    <p className="text-xs text-gray-500 truncate">{character.basicInfo.faction}</p>
                                </div>
                                <Badge className="text-xs bg-gray-100 text-gray-800">ID: {character.id}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content - Detail View */}
            <div className="flex-1 flex flex-col">
                {displayCharacter ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{displayCharacter.basicInfo.name}</h1>
                                        <p className="text-gray-600">
                                            {displayCharacter.basicInfo.role} {displayCharacter.basicInfo.faction && `• ${displayCharacter.basicInfo.faction}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="outline" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </Button>
                                            <Button variant="destructive" onClick={handleDeleteCharacter}>
                                                Delete
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => setIsEditing(true)}>Edit</Button>
                                            <Button variant="outline" onClick={handleConvertToPersona}>
                                                Convert to Persona
                                            </Button>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={handleGenerateCharacter}
                                                            disabled={isGeneratingCharacter}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                            <span className="sr-only">Generate Character</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Generate Character (no prompt)</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <Dialog open={isCharacterPromptDialogOpen} onOpenChange={setIsCharacterPromptDialogOpen}>
                                                        <TooltipTrigger asChild>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <Type className="h-4 w-4" />
                                                                    <span className="sr-only">Generate with Prompt</span>
                                                                </Button>
                                                            </DialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Generate Character with Custom Prompt</p>
                                                        </TooltipContent>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Generate Character with Custom Prompt</DialogTitle>
                                                                <DialogDescription>
                                                                    Enter your desired prompt for character creation here.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <Textarea
                                                                    id="customCharacterPrompt"
                                                                    value={dialogCharacterPrompt}
                                                                    onChange={(e) => setDialogCharacterPrompt(e.target.value)}
                                                                    className="min-h-[150px]"
                                                                    rows={6}
                                                                    placeholder="e.g., 'A wise old wizard with a long beard and a penchant for riddles.'"
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={handleGenerateCharacterWithPrompt} disabled={isGeneratingCharacter}>
                                                                    {isGeneratingCharacter ? 'Generating...' : 'Generate'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={displayCharacter.basicInfo.name}
                                                onChange={(e) => handleInputChange("basicInfo", "name", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={displayCharacter.basicInfo.age || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "age", parseInt(e.target.value))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input
                                                id="role"
                                                value={displayCharacter.basicInfo.role || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "role", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="faction">Faction</Label>
                                            <Input
                                                id="faction"
                                                value={displayCharacter.basicInfo.faction || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "faction", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avatar">Avatar URL</Label>
                                            <Input
                                                id="avatar"
                                                value={displayCharacter.basicInfo.avatar || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "avatar", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reputation">Reputation</Label>
                                            <Textarea
                                                id="reputation"
                                                value={displayCharacter.basicInfo.reputation || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "reputation", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="background">Background</Label>
                                            <Textarea
                                                id="background"
                                                value={displayCharacter.basicInfo.background || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "background", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstImpression">First Impression</Label>
                                            <Textarea
                                                id="firstImpression"
                                                value={displayCharacter.basicInfo.firstImpression || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "firstImpression", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appearance">Appearance</Label>
                                            <Textarea
                                                id="appearance"
                                                value={displayCharacter.basicInfo.appearance || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "appearance", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Personality (OCEAN) */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="w-5 h-5" />
                                            Personality (OCEAN Traits)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.entries(displayCharacter.personality).map(([trait, value]) => (
                                            <div key={trait} className="space-y-2">
                                                <Label htmlFor={trait}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Label>
                                                <Input
                                                    id={trait}
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => handleInputChange("personality", trait, parseInt(e.target.value))}
                                                    disabled={!isEditing}
                                                    min={-100}
                                                    max={100}
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                

                                {/* Preferences */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="w-5 h-5" />
                                            Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="attractedToTraits">Attracted To Traits (comma-separated)</Label>
                                            <Input
                                                id="attractedToTraits"
                                                value={displayCharacter.preferences?.attractedToTraits?.join(", ") || ""}
                                                onChange={(e) => handleInputChange("preferences", "attractedToTraits", e.target.value.split(",").map(s => s.trim()))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dislikesTraits">Dislikes Traits (comma-separated)</Label>
                                            <Input
                                                id="dislikesTraits"
                                                value={displayCharacter.preferences?.dislikesTraits?.join(", ") || ""}
                                                onChange={(e) => handleInputChange("preferences", "dislikesTraits", e.target.value.split(",").map(s => s.trim()))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gossipTendency">Gossip Tendency</Label>
                                            <Select
                                                value={displayCharacter.preferences?.gossipTendency || "low"}
                                                onValueChange={(value) => handleInputChange("preferences", "gossipTendency", value)}
                                                disabled={!isEditing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Character Selected</h3>
                            <p className="text-gray-500">Select a character from the list or add a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
