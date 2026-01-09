import { useParleyStore } from "@/lib/store"
import { Character, Persona as PlayerPersona } from "@/lib/types"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProceduralGeneratorDialog } from "@/components/character/procedural-generator-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Save, Plus, Book, Brain, Heart, Settings, Sparkles, Type, ChevronDown, Upload, Wand2 } from "lucide-react"
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
import { SectionHeader } from "@/components/ui/section-header";
import { Menu } from "lucide-react";

import RelationshipDisplay from "@/components/relationship-display";
import { useEntityStore } from "@/lib/entityStore";

export default function CharacterConfiguration() {
    const { worldDescription, aiStyle, _hasHydrated, avatarGenerationSettings } = useParleyStore()
    const { characters, addCharacter, updateCharacter, deleteCharacter, addPlayerPersona, playerPersonas, characterGroups, updateCharacterGroup, locations } = useEntityStore()
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

    // Procedural Generator State
    const [isProceduralGeneratorOpen, setIsProceduralGeneratorOpen] = useState(false);

    // Relationship Generator State
    const [isGeneratingRelationship, setIsGeneratingRelationship] = useState(false);
    const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
    const [relationshipPersonaId, setRelationshipPersonaId] = useState<string>("");
    const [relationshipContext, setRelationshipContext] = useState("");

    const handleApplyProceduralData = (data: { name: string; age: number; gender: string; background: string; origin: string; role: string }) => {
        if (!editedCharacter && !selectedCharacter) return;

        // Helper to update field even if nested
        const update = (section: any, field: string, value: any) => handleInputChange(section, field, value);

        update("basicInfo", "name", data.name);
        update("basicInfo", "age", data.age);
        update("basicInfo", "gender", data.gender);
        update("basicInfo", "background", data.background);
        update("basicInfo", "role", data.role);
    };
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
        section: keyof Character | "basicInfo" | "personality" | "idealMatch",
        field: string,
        value: string | number | string[] | undefined
    ) => {
        setEditedCharacter((prev) => {
            if (!prev) return null

            const newCharacter = { ...prev }

            if (section === "basicInfo" || section === "personality" || section === "idealMatch") {
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

    const handleLocationChange = (locationId: string) => {
        setEditedCharacter((prev) => {
            if (!prev) return null;
            return { ...prev, locationId: locationId === "unassigned" ? undefined : locationId };
        });
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
            idealMatch: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
            // preferences removed
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
            const body: { characterDescription?: string; worldDescription?: string; aiStyle?: string; existingContext?: any } = {};

            // Context-Awareness: Inject existing data if available
            if (displayCharacter) {
                const context: any = {};
                const info = displayCharacter.basicInfo;

                if (info.name && info.name !== "New Character") context.name = info.name;
                if (info.role) context.role = info.role;
                if (info.background) context.background = info.background;
                if (info.gender) context.gender = info.gender;
                if (info.age && info.age > 0) context.age = info.age;

                if (Object.keys(context).length > 0) {
                    body.existingContext = context;
                }
            }

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
                body: JSON.stringify({
                    imageDescription: dialogAvatarPrompt,
                    overrides: avatarGenerationSettings
                }),
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
                    const avatarUrl = `${uploadData.url}?t=${Date.now()}`;
                    console.log('Setting avatar URL:', avatarUrl);

                    if (editedCharacter) {
                        handleInputChange("basicInfo", "avatar", avatarUrl);
                    } else if (selectedCharacter) {
                        // Directly update the store if we are not in edit mode
                        const updatedCharacter = {
                            ...selectedCharacter,
                            basicInfo: { ...selectedCharacter.basicInfo, avatar: avatarUrl }
                        };
                        updateCharacter(updatedCharacter);
                    }
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

    const handleCreateRelationship = async () => {
        if (!displayCharacter || !relationshipPersonaId) return;

        setIsGeneratingRelationship(true);
        try {
            const persona = playerPersonas.find(p => p.id === relationshipPersonaId);
            if (!persona) return;

            const response = await fetch('/api/generate/relationship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    character: displayCharacter,
                    persona: persona,
                    worldDescription: worldDescription,
                    aiStyle: aiStyle,
                    relationshipContext: relationshipContext
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const newRelationship = {
                    ...data.relationship,
                    characterId: displayCharacter.id,
                    personaId: persona.id,
                    chat_summaries: []
                };

                // Add to character relationships
                const updatedCharacter = {
                    ...displayCharacter,
                    relationships: [...displayCharacter.relationships, newRelationship]
                };

                if (editedCharacter) {
                    setEditedCharacter(updatedCharacter);
                } else {
                    updateCharacter(updatedCharacter);
                }

                setIsRelationshipDialogOpen(false);
                setRelationshipPersonaId("");
                setRelationshipContext("");
            } else {
                console.error('Failed to generate relationship');
                alert('Failed to generate relationship');
            }
        } catch (error) {
            console.error('Error generating relationship:', error);
            alert('Error generating relationship');
        } finally {
            setIsGeneratingRelationship(false);
        }
    };

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Left Sidebar - Master List */}
            <div className="w-80 bg-background border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="type-ui-label text-muted-foreground">Characters</h2>
                        <Button size="sm" variant="ghost" onClick={handleAddCharacter} className="h-8 w-8 p-0 hover:bg-accent hover:text-foreground">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {characters.map((character) => (
                        <div
                            key={character.id}
                            onClick={() => handleSelect(character)}
                            className={`p-4 border-b border-border/50 cursor-pointer transition-all duration-200 ${selectedId === character.id
                                ? "bg-primary/5 border-l-2 border-l-primary"
                                : "hover:bg-accent/50 border-l-2 border-l-transparent"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pointer-events-none">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Avatar className="w-8 h-8 border border-border shadow-sm">
                                            <AvatarImage src={character.basicInfo.avatar} alt={character.basicInfo.name} />
                                            <AvatarFallback className="bg-muted text-muted-foreground">{character.basicInfo.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className={`font-medium truncate ${selectedId === character.id ? "text-primary" : "text-foreground"}`}>{character.basicInfo.name}</h3>
                                    </div>
                                    <p className="type-body-xs text-muted-foreground truncate uppercase tracking-wide">{character.basicInfo.role || "Unknown Role"}</p>
                                </div>
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
                        <div className="bg-muted/30 border-b border-border p-6 md:p-12 pb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                                        <AvatarImage src={displayCharacter.basicInfo.avatar} alt={displayCharacter.basicInfo.name} />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-2xl">{displayCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="type-h2 text-foreground">{displayCharacter.basicInfo.name}</h1>
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
                                                        className="w-6 h-6 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                                        asChild
                                                    >
                                                        <div>
                                                            <Upload className="w-4 h-4" />
                                                        </div>
                                                    </Button>
                                                </label>
                                            )}
                                        </div>
                                        <p className="type-ui-label text-muted-foreground">
                                            {displayCharacter.basicInfo.role || "NO ROLE"} {displayCharacter.basicInfo.faction && `• ${displayCharacter.basicInfo.faction}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="ghost" onClick={handleCancel} className="type-ui-label text-muted-foreground hover:text-foreground">
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 type-ui-label shadow-sm rounded-sm">
                                                Save Changes
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={handleDeleteCharacter} title="Delete" className="rounded-sm">
                                                <div className="sr-only">Delete</div>
                                                <span className="text-lg">×</span>
                                            </Button>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={handleGenerateCharacter}
                                                            disabled={isGeneratingCharacter}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Auto-Generate Details</p>
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
                                                                    className="h-8 w-8 rounded-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
                                                                >
                                                                    <Type className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Generate with Prompt</p>
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
                                                                    className="h-8 w-8 rounded-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
                                                                    onClick={handleGenerateAvatarDescription}
                                                                    disabled={isGeneratingAvatar}
                                                                >
                                                                    <Upload className="h-4 w-4" />
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
                                            <Button onClick={() => setIsEditing(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 type-ui-label shadow-sm rounded-sm">Edit</Button>
                                            <Button variant="ghost" onClick={handleConvertToPersona} className="type-ui-label text-muted-foreground hover:text-foreground">
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
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6">
                                        <SectionHeader title="Basic Information" />
                                    </div>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="type-ui-label text-muted-foreground">Name</Label>
                                            <Input
                                                id="name"
                                                value={displayCharacter.basicInfo.name}
                                                onChange={(e) => handleInputChange("basicInfo", "name", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="type-ui-label text-muted-foreground">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={displayCharacter.basicInfo.age || 0}
                                                onChange={(e) => handleInputChange("basicInfo", "age", parseInt(e.target.value))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="type-ui-label text-muted-foreground">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={displayCharacter.basicInfo.gender || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="type-ui-label text-muted-foreground">Role</Label>
                                            <Input
                                                id="role"
                                                value={displayCharacter.basicInfo.role || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "role", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="faction" className="type-ui-label text-muted-foreground">Faction</Label>
                                            <Input
                                                id="faction"
                                                value={displayCharacter.basicInfo.faction || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "faction", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="type-ui-label text-muted-foreground">Location</Label>
                                            <Select
                                                disabled={!isEditing}
                                                value={displayCharacter.locationId || "unassigned"}
                                                onValueChange={handleLocationChange}
                                            >
                                                <SelectTrigger id="location">
                                                    <SelectValue placeholder="Select a location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {locations.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>
                                                            {loc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reputation" className="type-ui-label text-muted-foreground">Reputation</Label>
                                            <Textarea
                                                id="reputation"
                                                value={displayCharacter.basicInfo.reputation || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "reputation", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="background" className="type-ui-label text-muted-foreground">Background</Label>
                                            <Textarea
                                                id="background"
                                                value={displayCharacter.basicInfo.background || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "background", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstImpression" className="type-ui-label text-muted-foreground">First Impression</Label>
                                            <Textarea
                                                id="firstImpression"
                                                value={displayCharacter.basicInfo.firstImpression || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "firstImpression", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appearance" className="type-ui-label text-muted-foreground">Appearance</Label>
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
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6">
                                        <SectionHeader title="Personality (OCEAN)" />
                                    </div>
                                    <CardContent className="space-y-4">
                                        {Object.entries(displayCharacter.personality).map(([trait, value]) => (
                                            <div key={trait} className="space-y-2">
                                                <Label htmlFor={trait} className="type-ui-label text-muted-foreground">{trait.charAt(0).toUpperCase() + trait.slice(1)}</Label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        id={trait}
                                                        type="number"
                                                        value={Math.round((value as number) / 10)}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) {
                                                                handleInputChange("personality", trait, Math.min(100, Math.max(0, val * 10)));
                                                            }
                                                        }}
                                                        disabled={!isEditing}
                                                        min={1}
                                                        max={10}
                                                        className="w-20"
                                                    />
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={Math.round((value as number) / 10)}
                                                        onChange={(e) => handleInputChange("personality", trait, parseInt(e.target.value) * 10)}
                                                        disabled={!isEditing}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Ideal Match (OCEAN Preferences) */}
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6">
                                        <SectionHeader title="Match Preferences" />
                                    </div>
                                    <CardContent className="space-y-4">
                                        <div className="type-body-sm text-muted-foreground mb-4">
                                            Define the personality traits this character finds most attractive in a partner.
                                        </div>
                                        {displayCharacter.idealMatch && Object.entries(displayCharacter.idealMatch).map(([trait, value]) => (
                                            <div key={trait} className="space-y-2">
                                                <Label htmlFor={`ideal-${trait}`} className="type-ui-label text-muted-foreground">{trait.charAt(0).toUpperCase() + trait.slice(1)}</Label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        id={`ideal-${trait}`}
                                                        type="number"
                                                        value={Math.round((value as number) / 10)}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) {
                                                                handleInputChange("idealMatch", trait, Math.min(100, Math.max(0, val * 10)));
                                                            }
                                                        }}
                                                        disabled={!isEditing}
                                                        min={1}
                                                        max={10}
                                                        className="w-20"
                                                    />
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={Math.round((value as number) / 10)}
                                                        onChange={(e) => handleInputChange("idealMatch", trait, parseInt(e.target.value) * 10)}
                                                        disabled={!isEditing}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>



                                {/* Relationship to Player Persona */}
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6 flex justify-between items-center px-4">
                                        <SectionHeader title="Relationships" className="flex-1 mb-0 mt-0" />
                                        {isEditing && (
                                            <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Create New Relationship</DialogTitle>
                                                        <DialogDescription>
                                                            Select a persona and describe the relationship context. The system will generate the initial dynamics.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Persona</Label>
                                                            <Select value={relationshipPersonaId} onValueChange={setRelationshipPersonaId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a persona" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {playerPersonas
                                                                        .filter(p => !displayCharacter.relationships.some(r => r.personaId === p.id))
                                                                        .map(p => (
                                                                            <SelectItem key={p.id} value={p.id}>{p.basicInfo.name}</SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Relationship Context</Label>
                                                            <Textarea
                                                                placeholder="e.g. Childhood friends, sworn enemies, met at a bar..."
                                                                value={relationshipContext}
                                                                onChange={(e) => setRelationshipContext(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleCreateRelationship} disabled={!relationshipPersonaId || isGeneratingRelationship}>
                                                            {isGeneratingRelationship ? "Generating..." : "Create Relationship"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
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
                                            <p className="type-body-sm text-muted-foreground">No relationships yet.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Character Groups */}
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6">
                                        <SectionHeader title="Character Groups" />
                                    </div>
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
                                            <p className="type-body-sm text-muted-foreground">No character groups defined. Create them in the Character Group Configuration page.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Preferences */}

                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="type-ui-subhead text-foreground mb-2">No Character Selected</h3>
                            <p className="type-body-sm text-muted-foreground">Select a character from the list or add a new one</p>
                        </div>
                    </div>
                )}
            </div>

            <ProceduralGeneratorDialog
                open={isProceduralGeneratorOpen}
                onOpenChange={setIsProceduralGeneratorOpen}
                onApply={handleApplyProceduralData}
                characterId={displayCharacter?.id || ''}
            />
        </div >
    )
}
