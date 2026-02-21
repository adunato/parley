import { useParleyStore } from "@/lib/store"
import { useBioStore } from "@/lib/store/bioStore";
import { Character, Persona as PlayerPersona, Relationship } from "@/lib/types"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProceduralGeneratorDialog } from "@/components/character/procedural-generator-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Plus, Book, Brain, Heart, Settings, Sparkles, Type, ChevronDown, Upload, Wand2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
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
import { useDebouncedCallback } from "use-debounce";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function CharacterConfiguration() {
    const { worldDescription, aiStyle, _hasHydrated, avatarGenerationSettings } = useParleyStore()
    const { characters, addCharacter, updateCharacter, deleteCharacter, addPlayerPersona, playerPersonas, characterGroups, updateCharacterGroup, locations, updateLocation } = useEntityStore()
    const { professions } = useBioStore();

    // Selection state
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Local buffer state (for instant/debounced save)
    const [localCharacter, setLocalCharacter] = useState<Character | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const isDirtyRef = useRef(false);

    // Dialog & UI states
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
    const [isCharacterPromptDialogOpen, setIsCharacterPromptDialogOpen] = useState(false);
    const [dialogCharacterPrompt, setDialogCharacterPrompt] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isAvatarPromptDialogOpen, setIsAvatarPromptDialogOpen] = useState(false);
    const [dialogAvatarPrompt, setDialogAvatarPrompt] = useState('');
    const [characterGroupMemberships, setCharacterGroupMemberships] = useState<string[]>([]);
    const [isProceduralGeneratorOpen, setIsProceduralGeneratorOpen] = useState(false); // Procedural Generator State
    const [isGeneratingRelationship, setIsGeneratingRelationship] = useState(false); // Relationship Generator State
    const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
    const [relationshipPersonaId, setRelationshipPersonaId] = useState<string>("");
    const [relationshipContext, setRelationshipContext] = useState("");

    // Debounced save function
    const debouncedSave = useDebouncedCallback((character: Character) => {
        setSaveStatus('saving');
        try {
            updateCharacter(character);
            setSaveStatus('saved');
            isDirtyRef.current = false;
            setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
        } catch (error) {
            console.error("Failed to save character", error);
            setSaveStatus('error');
        }
    }, 1000);

    // Sync selectedId with localCharacter
    const selectedCharacter = characters.find((c) => c.id === selectedId)

    useEffect(() => {
        // This effect is mainly for ensuring we load the character into local state when selected
        if (selectedCharacter) {
            // Only update local from store if NOT dirty or if ID changed.
            // If ID matches and we are dirty, we rely on local state.
            // If ID matches and Not dirty, we sync (in case of background updates?)
            if (!isDirtyRef.current || (localCharacter?.id !== selectedCharacter.id)) {
                setLocalCharacter({ ...selectedCharacter });

                // Initialize characterGroupMemberships based on which groups this character belongs to
                const currentGroupIds = characterGroups
                    .filter(group => group.characters.includes(selectedCharacter.id))
                    .map(group => group.id);
                setCharacterGroupMemberships(currentGroupIds);
            }
        } else {
            // Only clear if we really don't have a selected character (e.g. deleted or empty list)
            if (!selectedId) {
                setLocalCharacter(null);
                setCharacterGroupMemberships([]);
            }
        }
    }, [selectedId, selectedCharacter, characterGroups]);

    const handleSelect = (character: Character) => {
        if (localCharacter && isDirtyRef.current) {
            debouncedSave.flush();
        }
        setSelectedId(character.id)
    }

    const handleInputChange = (
        section: keyof Character | "basicInfo" | "personality" | "idealMatch",
        field: string,
        value: string | number | string[] | undefined
    ) => {
        setLocalCharacter((prev) => {
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

            isDirtyRef.current = true;
            setSaveStatus('saving');
            debouncedSave(newCharacter);
            return newCharacter
        })
    }

    // Helper to update field even if nested
    const handleApplyProceduralData = (data: { name: string; age: number; gender: string; background: string; origin: string; role: string }) => {
        if (!localCharacter) return;

        // We need to batch these updates or handle them sequentially
        // For simplicity, let's just make a new object and set it once
        setLocalCharacter((prev) => {
            if (!prev) return null;
            const newChar = {
                ...prev,
                basicInfo: {
                    ...prev.basicInfo,
                    name: data.name,
                    age: data.age,
                    gender: data.gender,
                    background: data.background,
                    role: data.role
                }
            };
            isDirtyRef.current = true;
            setSaveStatus('saving');
            debouncedSave(newChar);
            return newChar;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !localCharacter) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setSaveStatus('saving');
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                handleInputChange("basicInfo", "avatar", data.url);
            } else {
                console.error('Failed to upload image', await res.text());
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setSaveStatus('error');
        }
    };

    const handleRoleChange = (newRoleId: string) => {
        if (!localCharacter) return;

        let shouldUnassign = false;
        if (localCharacter.locationId) {
            const currentLocation = locations.find(l => l.id === localCharacter.locationId);
            if (currentLocation) {
                // Check if the character is assigned to a slot that requires the OLD profession
                const assignedSlot = currentLocation.professionSlots?.find(s => s.characterId === localCharacter.id);
                if (assignedSlot && assignedSlot.professionId !== newRoleId) {
                    shouldUnassign = true;
                    // Unassign from location's slot
                    const newSlots = currentLocation.professionSlots!.map(s =>
                        s.id === assignedSlot.id ? { ...s, characterId: undefined } : s
                    );
                    updateLocation({ ...currentLocation, professionSlots: newSlots });
                    alert(`Unassigned from ${currentLocation.name} because the new profession does not match the slot's required profession.`);
                }
            }
        }

        setLocalCharacter((prev) => {
            if (!prev) return null;
            const newCharacter = { ...prev };
            newCharacter.basicInfo = { ...newCharacter.basicInfo, role: newRoleId };
            if (shouldUnassign) {
                newCharacter.locationId = undefined;
            }

            isDirtyRef.current = true;
            setSaveStatus('saving');
            debouncedSave(newCharacter);
            return newCharacter;
        });
    };

    const handleAddCharacter = () => {
        if (localCharacter && isDirtyRef.current) {
            debouncedSave.flush();
        }

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
            relationships: [],
        }
        addCharacter(newCharacter)
        setSelectedId(newId)
        // Set local character immediately to avoid flicker/race condition
        setLocalCharacter(newCharacter)
        isDirtyRef.current = false;
    }

    const handleDeleteCharacter = () => {
        if (localCharacter && localCharacter.id) {
            const idToDelete = localCharacter.id;
            deleteCharacter(idToDelete)
            // Just clear local state, the effect will pick up the new selectedId (or lack thereof)
            setLocalCharacter(null)

            // Safety: Select another character if available
            const remaining = characters.filter(c => c.id !== idToDelete);
            if (remaining.length > 0) {
                setSelectedId(remaining[0].id);
            } else {
                setSelectedId(null);
            }
        }
    }

    const handleDeleteRelationship = (characterId: string, personaId: string) => {
        if (localCharacter) {
            setLocalCharacter(prev => {
                if (!prev) return null;
                const updatedRelationships = prev.relationships.filter(
                    (rel) => !(rel.characterId === characterId && rel.personaId === personaId)
                );
                const updated = { ...prev, relationships: updatedRelationships };
                isDirtyRef.current = true;
                setSaveStatus('saving');
                debouncedSave(updated);
                return updated;
            });
        }
    };

    const handleCreateRelationship = async () => {
        if (!localCharacter || !relationshipPersonaId) return;

        setIsGeneratingRelationship(true);
        try {
            const persona = playerPersonas.find(p => p.id === relationshipPersonaId);
            if (!persona) return;

            const response = await fetch('/api/generate/relationship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    character: localCharacter,
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
                    characterId: localCharacter.id,
                    personaId: persona.id,
                    chat_summaries: []
                };

                // Add to character relationships
                setLocalCharacter(prev => {
                    if (!prev) return null;
                    const updated = { ...prev, relationships: [...prev.relationships, newRelationship] };
                    // Force immediate save for critical structural changes
                    updateCharacter(updated);
                    return updated;
                });

                setIsRelationshipDialogOpen(false);
                setRelationshipPersonaId("");
                setRelationshipContext("");
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
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

    // Group Memberships Handling
    const handleGroupToggle = (groupId: string) => {
        if (!localCharacter) return;

        const isMember = characterGroupMemberships.includes(groupId);
        const newMemberships = isMember
            ? characterGroupMemberships.filter(id => id !== groupId)
            : [...characterGroupMemberships, groupId];

        setCharacterGroupMemberships(newMemberships);

        // Immediate Store Update for Groups (since they are separate entities)
        const group = characterGroups.find(g => g.id === groupId);
        if (group) {
            const updatedGroup = {
                ...group,
                characters: isMember
                    ? group.characters.filter(cid => cid !== localCharacter.id)
                    : [...group.characters, localCharacter.id]
            };
            updateCharacterGroup(updatedGroup);
        }
    };

    const handleConvertToPersona = () => {
        if (localCharacter) {
            const newPersona: PlayerPersona = {
                id: localCharacter.id,
                basicInfo: {
                    name: localCharacter.basicInfo.name,
                    age: localCharacter.basicInfo.age,
                    gender: localCharacter.basicInfo.gender,
                    role: localCharacter.basicInfo.role,
                    faction: localCharacter.basicInfo.faction,
                    reputation: localCharacter.basicInfo.reputation,
                    background: localCharacter.basicInfo.background,
                    firstImpression: localCharacter.basicInfo.firstImpression,
                    appearance: localCharacter.basicInfo.appearance,
                    avatar: localCharacter.basicInfo.avatar,
                },
            };
            addPlayerPersona(newPersona);
            alert(`Converted ${newPersona.basicInfo.name} to a new persona: ${newPersona.id}`);
        }
    };

    // Generation Handlers (Character & Avatar)
    const generateCharacter = async (prompt: string) => {
        setIsGeneratingCharacter(true);
        try {
            const body: { characterDescription?: string; worldDescription?: string; aiStyle?: string; existingContext?: any } = {};

            // Context-Awareness: Inject existing data if available
            if (localCharacter) {
                const context: any = {};
                const info = localCharacter.basicInfo;

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

                if (localCharacter && localCharacter.id) {
                    // Update existing
                    setLocalCharacter(prev => {
                        if (!prev) return null;
                        const updated = { ...prev, ...generatedCharacterData, id: prev.id };
                        updateCharacter(updated);
                        return updated;
                    });
                } else {
                    // This branch shouldn't really be hit if we always create a blank char first
                    console.warn("Generated character but no local character selected");
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

    const handleGenerateCharacter = () => generateCharacter("");
    const handleGenerateCharacterWithPrompt = () => generateCharacter(dialogCharacterPrompt);

    const handleGenerateAvatarDescription = async () => {
        if (!localCharacter) return;
        setIsGeneratingAvatar(true);
        try {
            const response = await fetch('/api/generate/avatar-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterOrPersonaData: localCharacter }),
            });
            const data = await response.json();
            if (response.ok) {
                setDialogAvatarPrompt(data.imageDescription);
                setIsAvatarPromptDialogOpen(true);
            } else {
                alert('Error generating avatar description: ' + data.error);
            }
        } catch (error) {
            alert('An unexpected error occurred while generating the avatar description.');
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!localCharacter || !dialogAvatarPrompt) return;
        setIsGeneratingAvatar(true);
        try {
            const imageResponse = await fetch('/api/generate/avatar-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageDescription: dialogAvatarPrompt,
                    overrides: avatarGenerationSettings,
                    comfyuiAddress: avatarGenerationSettings.comfyuiAddress
                }),
            });
            const imageData = await imageResponse.json();

            if (imageResponse.ok && imageData.imageData) {
                const byteCharacters = atob(imageData.imageData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });
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
                    handleInputChange("basicInfo", "avatar", avatarUrl);
                } else {
                    alert('Failed to upload generated image.');
                }
            } else {
                alert('Error generating image: ' + imageData.error);
            }
        } catch (error) {
            alert('An unexpected error occurred while generating the avatar.');
        } finally {
            setIsGeneratingAvatar(false);
            setIsAvatarPromptDialogOpen(false);
            setDialogAvatarPrompt('');
        }
    };

    // Display variable (always consistent with local buffer or null)
    const displayCharacter = localCharacter;

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

                                            {/* Always allow image upload */}
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
                                        </div>
                                        <p className="type-ui-label text-muted-foreground">
                                            {displayCharacter.basicInfo.role || "NO ROLE"} {displayCharacter.basicInfo.faction && `• ${displayCharacter.basicInfo.faction}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {/* Status Indicator */}
                                    <div className="flex items-center text-xs font-medium uppercase tracking-wider mr-4">
                                        {saveStatus === 'saving' && (
                                            <span className="text-muted-foreground flex items-center gap-1.5 animate-pulse">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving...
                                            </span>
                                        )}
                                        {saveStatus === 'saved' && (
                                            <span className="text-green-500 flex items-center gap-1.5 transition-opacity duration-500">
                                                <CheckCircle className="w-3 h-3" />
                                                Saved
                                            </span>
                                        )}
                                        {saveStatus === 'error' && (
                                            <span className="text-destructive flex items-center gap-1.5">
                                                <AlertCircle className="w-3 h-3" />
                                                Save Failed
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <Button variant="ghost" onClick={handleConvertToPersona} className="type-ui-label text-muted-foreground hover:text-foreground">
                                        Convert to Persona
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
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                {/* Basic Information */}
                                <Card className="border-border shadow-sm">
                                    <div className="pt-6 relative">
                                        <SectionHeader title="Basic Information" />
                                        <div className="absolute right-4 top-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setIsProceduralGeneratorOpen(true)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Open Procedural Generator</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="type-ui-label text-muted-foreground">Name</Label>
                                            <Input
                                                id="name"
                                                value={displayCharacter.basicInfo.name}
                                                onChange={(e) => handleInputChange("basicInfo", "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="type-ui-label text-muted-foreground">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={displayCharacter.basicInfo.age || 0}
                                                onChange={(e) => handleInputChange("basicInfo", "age", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="type-ui-label text-muted-foreground">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={displayCharacter.basicInfo.gender || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="type-ui-label text-muted-foreground">Profession</Label>
                                            <Select
                                                value={displayCharacter.basicInfo.role || ""}
                                                onValueChange={handleRoleChange}
                                            >
                                                <SelectTrigger id="role">
                                                    <SelectValue placeholder="Select a profession" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {professions && professions.length > 0 ? (
                                                        professions.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>No professions configured</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="faction" className="type-ui-label text-muted-foreground">Faction</Label>
                                            <Input
                                                id="faction"
                                                value={displayCharacter.basicInfo.faction || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "faction", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="type-ui-label text-muted-foreground">Location</Label>
                                            <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm text-muted-foreground">
                                                {displayCharacter.locationId ? locations.find(l => l.id === displayCharacter.locationId)?.name || 'Unknown Location' : 'Unassigned'}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Locations are assigned through the Location Configuration page via profession slots.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reputation" className="type-ui-label text-muted-foreground">Reputation</Label>
                                            <Textarea
                                                id="reputation"
                                                value={displayCharacter.basicInfo.reputation || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "reputation", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="background" className="type-ui-label text-muted-foreground">Background</Label>
                                            <Textarea
                                                id="background"
                                                value={displayCharacter.basicInfo.background || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "background", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstImpression" className="type-ui-label text-muted-foreground">First Impression</Label>
                                            <Textarea
                                                id="firstImpression"
                                                value={displayCharacter.basicInfo.firstImpression || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "firstImpression", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appearance" className="type-ui-label text-muted-foreground">Appearance</Label>
                                            <Textarea
                                                id="appearance"
                                                value={displayCharacter.basicInfo.appearance || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "appearance", e.target.value)}
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
                                                            onChange={() => handleGroupToggle(group.id)}
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
