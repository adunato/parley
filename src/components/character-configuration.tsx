import { useParleyStore } from "@/lib/store"
import { Character, Persona as PlayerPersona } from "@/lib/types"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Save, Plus, Book, Brain, Heart, Settings, Sparkles, Type, ChevronDown, Upload } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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

import RelationshipDisplay from "@/components/relationship-display";
import {useEntityStore} from "@/lib/entityStore";

export default function CharacterConfiguration() {
    const { worldDescription, aiStyle, _hasHydrated } = useParleyStore()
    const { characters, addCharacter, updateCharacter, deleteCharacter, addPlayerPersona, playerPersonas, characterGroups, updateCharacterGroup } = useEntityStore()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [editedCharacter, setEditedCharacter] = useState<Character | null>(null)
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
    const [isCharacterPromptDialogOpen, setIsCharacterPromptDialogOpen] = useState(false);
    const [dialogCharacterPrompt, setDialogCharacterPrompt] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isAvatarPromptDialogOpen, setIsAvatarPromptDialogOpen] = useState(false);
    const [dialogAvatarPrompt, setDialogAvatarPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [characterGroupMemberships, setCharacterGroupMemberships] = useState<string[]>([]);
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editedCharacter) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                handleInputChange("basicInfo", "avatar", data.url);
            } else {
                console.error('Failed to upload image', await res.text());
                alert('Failed to upload image.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('An unexpected error occurred during image upload.');
        }
    };

    const selectedCharacter = characters.find((c) => c.id === selectedId)

    useEffect(() => {
        const character = characters.find((c) => c.id === selectedId);
        if (character) {
            setEditedCharacter({ ...character });
            // Initialize characterGroupMemberships based on which groups this character belongs to
            const currentGroupIds = characterGroups
                .filter(group => group.characters.includes(character.id))
                .map(group => group.id);
            setCharacterGroupMemberships(currentGroupIds);
        } else {
            setEditedCharacter(null);
            setCharacterGroupMemberships([]);
        }
    }, [selectedId, characters, characterGroups]);

    const handleSelect = (character: Character) => {
        setSelectedId(character.id)
        setIsEditing(false);
    }

    const handleSave = () => {
        if (editedCharacter) {
            if (characters.some(c => c.id === editedCharacter.id)) {
                updateCharacter(editedCharacter)
            } else {
                addCharacter({ ...editedCharacter, id: editedCharacter.id || (characters.length > 0 ? (parseInt(characters[characters.length - 1].id) + 1) : 1).toString() })
            }

            // Update character group memberships
            characterGroups.forEach(group => {
                const isMember = characterGroupMemberships.includes(group.id);
                const alreadyInGroup = group.characters.includes(editedCharacter.id);

                if (isMember && !alreadyInGroup) {
                    // Add character to group
                    updateCharacterGroup({ ...group, characters: [...group.characters, editedCharacter.id] });
                } else if (!isMember && alreadyInGroup) {
                    // Remove character from group
                    updateCharacterGroup({ ...group, characters: group.characters.filter(charId => charId !== editedCharacter.id) });
                }
            });

            setEditedCharacter(null)
            setIsEditing(false);
            setCharacterGroupMemberships([]); // Clear memberships after saving
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

                if (section === "basicInfo" || section === "personality" || section === "preferences") {
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
            basicInfo: {
                name: "New Character",
                age: 0,
                gender: "",
                role: "",
                faction: "",
                reputation: "",
                background: "",
                firstImpression: "",
                appearance: "",
            },
            personality: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
            preferences: { attractedToTraits: [], dislikesTraits: [], gossipTendency: "low" },
            relationships: [],
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

    const handleDeleteRelationship = (characterId: string, personaId: string) => {
        if (editedCharacter) {
            const updatedRelationships = editedCharacter.relationships.filter(
                (rel) => !(rel.characterId === characterId && rel.personaId === personaId)
            );
            setEditedCharacter({ ...editedCharacter, relationships: updatedRelationships });
        }
    };

    const displayCharacter = editedCharacter || selectedCharacter

    const handleConvertToPersona = () => {
        if (displayCharacter) {
            const newPersona: PlayerPersona = {
                id: displayCharacter.id,
                basicInfo: {
                    name: displayCharacter.basicInfo.name,
                    age: displayCharacter.basicInfo.age,
                    gender: displayCharacter.basicInfo.gender,
                    role: displayCharacter.basicInfo.role,
                    faction: displayCharacter.basicInfo.faction,
                    reputation: displayCharacter.basicInfo.reputation,
                    background: displayCharacter.basicInfo.background,
                    firstImpression: displayCharacter.basicInfo.firstImpression,
                    appearance: displayCharacter.basicInfo.appearance,
                    avatar: displayCharacter.basicInfo.avatar,
                },
            };
            addPlayerPersona(newPersona);
            alert(`Converted ${newPersona.basicInfo.name} to a new persona: ${newPersona.id}`);
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

    const handleGenerateAvatarDescription = async () => {
        if (!displayCharacter) return;
        setIsGeneratingAvatar(true);
        try {
            const response = await fetch('/api/generate/avatar-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characterOrPersonaData: displayCharacter }),
            });
            const data = await response.json();
            if (response.ok) {
                setDialogAvatarPrompt(data.imageDescription);
                setIsAvatarPromptDialogOpen(true);
            } else {
                console.error('Failed to generate avatar description:', data.error);
                alert('Error generating avatar description: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating avatar description:', error);
            alert('An unexpected error occurred while generating the avatar description.');
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!displayCharacter || !dialogAvatarPrompt) return;
        setIsGeneratingAvatar(true);
        try {
            const imageResponse = await fetch('/api/generate/avatar-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageDescription: dialogAvatarPrompt }),
            });
            const imageData = await imageResponse.json();

            if (imageResponse.ok && imageData.imageData) {
                // Convert base64 to Blob and then to File object for upload
                const byteCharacters = atob(imageData.imageData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' }); // Assuming PNG for now
                const imageFile = new File([blob], `avatar_${Date.now()}.png`, { type: 'image/png' });

                const formData = new FormData();
                formData.append('avatar', imageFile);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    handleInputChange("basicInfo", "avatar", uploadData.url);
                } else {
                    console.error('Failed to upload generated image', await uploadResponse.text());
                    alert('Failed to upload generated image.');
                }
            } else {
                console.error('Failed to generate image:', imageData.error);
                alert('Error generating image: ' + imageData.error);
            }
        } catch (error) {
            console.error('Error generating avatar:', error);
            alert('An unexpected error occurred while generating the avatar.');
        } finally {
            setIsGeneratingAvatar(false);
            setIsAvatarPromptDialogOpen(false);
            setDialogAvatarPrompt('');
        }
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
                                    <div className="flex items-center gap-3 mb-1">
                                        <Avatar className="w-8 h-8 border-2 border-white">
                                            <AvatarImage src={character.basicInfo.avatar} alt={character.basicInfo.name} />
                                            <AvatarFallback>{character.basicInfo.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
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
                                    <Avatar className="w-20 h-20 border-4 border-white">
                                        <AvatarImage src={displayCharacter.basicInfo.avatar} alt={displayCharacter.basicInfo.name} />
                                        <AvatarFallback>{displayCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900">{displayCharacter.basicInfo.name}</h1>
                                        {isEditing && (
                                            <label className="cursor-pointer">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-6 h-6"
                                                    asChild
                                                >
                                                    <div>
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                </Button>
                                            </label>
                                        )}
                                    </div>
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
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <Dialog open={isAvatarPromptDialogOpen} onOpenChange={setIsAvatarPromptDialogOpen}>
                                                        <TooltipTrigger asChild>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={handleGenerateAvatarDescription}
                                                                    disabled={isGeneratingAvatar}
                                                                >
                                                                    <Upload className="h-4 w-4" />
                                                                    <span className="sr-only">Generate Avatar</span>
                                                                </Button>
                                                            </DialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Generate Avatar</p>
                                                        </TooltipContent>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Tweak Avatar Description</DialogTitle>
                                                                <DialogDescription>
                                                                    Review and edit the generated image description before generating the avatar.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <Textarea
                                                                    id="avatarPrompt"
                                                                    value={dialogAvatarPrompt}
                                                                    onChange={(e) => setDialogAvatarPrompt(e.target.value)}
                                                                    className="min-h-[150px]"
                                                                    rows={6}
                                                                    placeholder="e.g., 'A detailed portrait of a young woman with fiery red hair and emerald eyes, wearing a leather jacket.'"
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar}>
                                                                    {isGeneratingAvatar ? 'Generating...' : 'Generate Avatar'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => setIsEditing(true)}>Edit</Button>
                                            <Button variant="outline" onClick={handleConvertToPersona}>
                                                Convert to Persona
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}

                        

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
                                                value={displayCharacter.basicInfo.age || 0}
                                                onChange={(e) => handleInputChange("basicInfo", "age", parseInt(e.target.value))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={displayCharacter.basicInfo.gender || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
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
                                                    value={value as number}
                                                    onChange={(e) => handleInputChange("personality", trait, parseInt(e.target.value))}
                                                    disabled={!isEditing}
                                                    min={-100}
                                                    max={100}
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>



                                {/* Relationship to Player Persona */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="w-5 h-5" />
                                            Relationships
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {displayCharacter.relationships.length > 0 ? (
                                            <Accordion type="single" collapsible className="w-full">
                                                {displayCharacter.relationships.map((relationship) => {
                                                    const persona = playerPersonas.find(p => p.id === relationship.personaId);
                                                    return (
                                                        <AccordionItem key={relationship.personaId} value={relationship.personaId}>
                                                            <AccordionTrigger>
                                                                <div className="flex items-center justify-between w-full pr-4">
                                                                    <span>{persona?.basicInfo.name || "Unknown Persona"}</span>
                                                                    {isEditing && (
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Prevent the accordion from toggling
                                                                                handleDeleteRelationship(displayCharacter.id, relationship.personaId);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <RelationshipDisplay characterName={displayCharacter.basicInfo.name} relationship={relationship} />
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    );
                                                })}
                                            </Accordion>
                                        ) : (
                                            <p className="text-sm text-gray-500">No relationships yet.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Character Groups */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Book className="w-5 h-5" />
                                            Character Groups
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {characterGroups.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {characterGroups.map((group) => (
                                                    <div key={group.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`group-${group.id}`}
                                                            checked={characterGroupMemberships.includes(group.id)}
                                                            onChange={() => {
                                                                if (isEditing) {
                                                                    setCharacterGroupMemberships((prev) =>
                                                                        prev.includes(group.id)
                                                                            ? prev.filter((id) => id !== group.id)
                                                                            : [...prev, group.id]
                                                                    );
                                                                }
                                                            }}
                                                            disabled={!isEditing}
                                                        />
                                                        <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No character groups defined. Create them in the Character Group Configuration page.</p>
                                        )}
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
