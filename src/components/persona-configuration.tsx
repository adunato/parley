import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, Save, Plus, Sparkles, Type, Upload } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useParleyStore, PlayerPersona } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
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

export default function PersonaConfiguration() {
    const { playerPersonas, addPlayerPersona, updatePlayerPersona, deletePlayerPersona, worldDescription, aiStyle, _hasHydrated } = useParleyStore()
    const [selectedAlias, setSelectedAlias] = useState<string | null>(playerPersonas[0]?.alias || null)
    const [editedPersona, setEditedPersona] = useState<PlayerPersona | null>(null)
    const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
    const [isPersonaPromptDialogOpen, setIsPersonaPromptDialogOpen] = useState(false);
    const [dialogPersonaPrompt, setDialogPersonaPrompt] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isAvatarPromptDialogOpen, setIsAvatarPromptDialogOpen] = useState(false);
    const [dialogAvatarPrompt, setDialogAvatarPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editedPersona) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                handleInputChange("avatar", data.url);
            } else {
                console.error('Failed to upload image', await res.text());
                alert('Failed to upload image.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('An unexpected error occurred during image upload.');
        }
    };

    const selectedPersona = playerPersonas.find((p) => p.alias === selectedAlias)

    useEffect(() => {
        if (selectedPersona) {
            setEditedPersona({ ...selectedPersona })
        } else if (playerPersonas.length > 0) {
            setSelectedAlias(playerPersonas[0].alias)
            setEditedPersona({ ...playerPersonas[0] })
        } else {
            setEditedPersona(null)
        }
        setIsEditing(false);
    }, [selectedPersona, playerPersonas])

    const handleSelect = (persona: PlayerPersona) => {
        setSelectedAlias(persona.alias)
        setEditedPersona({ ...persona })
        setIsEditing(false);
    }

    const handleSave = () => {
        if (editedPersona) {
            if (playerPersonas.some(p => p.alias === editedPersona.alias)) {
                updatePlayerPersona(editedPersona)
            } else {
                addPlayerPersona(editedPersona)
            }
            setEditedPersona(null)
            setIsEditing(false);
        }
    }

    const handleCancel = () => {
        setEditedPersona(null)
        setIsEditing(false);
    }

    const handleInputChange = (field: keyof PlayerPersona, value: string) => {
        setEditedPersona((prev) => (prev ? { ...prev, [field]: value } : null))
    }

    const handleAddPersona = () => {
        const newPersona: PlayerPersona = {
            name: "New Persona",
            alias: `Persona-${playerPersonas.length + 1}`,
            reputation: "",
            background: "",
            firstImpression: "",
            role: "",
            faction: "",
            avatar: "",
            appearance: "",
        }
        addPlayerPersona(newPersona)
        setSelectedAlias(newPersona.alias)
        setEditedPersona(newPersona)
        setIsEditing(true);
    }

    const handleDeletePersona = () => {
        if (editedPersona && editedPersona.alias) {
            deletePlayerPersona(editedPersona.alias)
            setEditedPersona(null)
            setSelectedAlias(playerPersonas[0]?.alias || null)
            setIsEditing(false);
        }
    }

    const displayPersona = editedPersona || selectedPersona

    const generatePersona = async (prompt: string) => {
        setIsGeneratingPersona(true);
        try {
            const body: { personaDescription?: string; worldDescription?: string; aiStyle?: string } = {};
            if (prompt !== undefined && prompt !== '') {
                body.personaDescription = prompt;
            }
            if (_hasHydrated && worldDescription) {
                body.worldDescription = worldDescription;
            }
            if (_hasHydrated && aiStyle) {
                body.aiStyle = aiStyle;
            }
            const response = await fetch('/api/generate/persona', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                const generatedPersona: PlayerPersona = {
                    name: data.persona.name || "",
                    alias: data.persona.alias || `Persona-${playerPersonas.length + 1}`,
                    age: data.persona.age || 0,
                    reputation: data.persona.reputation || "",
                    background: data.persona.background || "",
                    firstImpression: data.persona.firstImpression || "",
                    role: data.persona.role || "",
                    faction: data.persona.faction || "",
                    avatar: "",
                    appearance: data.persona.appearance || "",
                };

                if (selectedAlias && selectedPersona) {
                    // Overwrite the currently selected persona
                    updatePlayerPersona({ ...selectedPersona, ...generatedPersona, alias: selectedPersona.alias });
                    setSelectedAlias(selectedPersona.alias);
                    setEditedPersona({ ...selectedPersona, ...generatedPersona, alias: selectedPersona.alias });
                } else {
                    // Add as a new persona
                    addPlayerPersona(generatedPersona);
                    setSelectedAlias(generatedPersona.alias);
                    setEditedPersona(generatedPersona);
                }
            } else {
                console.error('Failed to generate persona:', data.error);
                alert('Error generating persona: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating persona:', error);
            alert('An unexpected error occurred while generating the persona.');
        } finally {
            setIsGeneratingPersona(false);
            setIsPersonaPromptDialogOpen(false);
            setDialogPersonaPrompt('');
        }
    };

    const handleGeneratePersona = () => {
        generatePersona("");
    };

    const handleGeneratePersonaWithPrompt = () => {
        generatePersona(dialogPersonaPrompt);
    };

    const handleGenerateAvatarDescription = async () => {
        if (!displayPersona) return;
        setIsGeneratingAvatar(true);
        try {
            const response = await fetch('/api/generate/avatar-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characterOrPersonaData: displayPersona }),
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
        if (!displayPersona || !dialogAvatarPrompt) return;
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
                    handleInputChange("avatar", uploadData.url);
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
                        <h2 className="text-lg font-semibold text-gray-900">Player Personas</h2>
                        <Button size="sm" variant="outline" onClick={handleAddPersona}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{playerPersonas.length} personas</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {playerPersonas.map((persona) => (
                        <div
                            key={persona.alias}
                            onClick={() => handleSelect(persona)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedAlias === persona.alias ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Avatar className="w-8 h-8 border-2 border-white">
                                            <AvatarImage src={persona.avatar} alt={persona.name} />
                                            <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-medium text-gray-900 truncate">{persona.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{persona.alias}</p>
                                    <p className="text-xs text-gray-500 truncate">{persona.role}</p>
                                </div>
                                <Badge className="text-xs bg-gray-100 text-gray-800">{persona.faction}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content - Detail View */}
            <div className="flex-1 flex flex-col">
                {displayPersona ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-20 h-20 border-4 border-white">
                                        <AvatarImage src={displayPersona.avatar} alt={displayPersona.name} />
                                        <AvatarFallback>{displayPersona.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold text-gray-900">{displayPersona.name}</h1>
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
                                            {displayPersona.alias} {displayPersona.role && `• ${displayPersona.role}`}
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
                                            <Button variant="destructive" onClick={handleDeletePersona}>
                                                Delete
                                            </Button>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={handleGeneratePersona}
                                                            disabled={isGeneratingPersona}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                            <span className="sr-only">Generate Persona</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Generate Persona (no prompt)</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <Dialog open={isPersonaPromptDialogOpen} onOpenChange={setIsPersonaPromptDialogOpen}>
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
                                                            <p>Generate Persona with Custom Prompt</p>
                                                        </TooltipContent>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Generate Persona with Custom Prompt</DialogTitle>
                                                                <DialogDescription>
                                                                    Enter your desired prompt for persona creation here.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <Textarea
                                                                    id="customPersonaPrompt"
                                                                    value={dialogPersonaPrompt}
                                                                    onChange={(e) => setDialogPersonaPrompt(e.target.value)}
                                                                    className="min-h-[150px]"
                                                                    rows={6}
                                                                    placeholder="e.g., 'A stealthy rogue with a mysterious past and a knack for getting into trouble.'"
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={handleGeneratePersonaWithPrompt} disabled={isGeneratingPersona}>
                                                                    {isGeneratingPersona ? 'Generating...' : 'Generate'}
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
                                                value={displayPersona.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alias">Alias</Label>
                                            <Input
                                                id="alias"
                                                value={displayPersona.alias}
                                                onChange={(e) => handleInputChange("alias", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={displayPersona.age || ""}
                                                onChange={(e) => handleInputChange("age", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input
                                                id="role"
                                                value={displayPersona.role || ""}
                                                onChange={(e) => handleInputChange("role", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="faction">Faction</Label>
                                            <Input
                                                id="faction"
                                                value={displayPersona.faction || ""}
                                                onChange={(e) => handleInputChange("faction", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avatar">Avatar URL</Label>
                                            <Input
                                                id="avatar"
                                                value={displayPersona.avatar || ""}
                                                onChange={(e) => handleInputChange("avatar", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appearance">Appearance</Label>
                                            <Textarea
                                                id="appearance"
                                                value={displayPersona.appearance || ""}
                                                onChange={(e) => handleInputChange("appearance", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Additional Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reputation">Reputation</Label>
                                            <Textarea
                                                id="reputation"
                                                value={displayPersona.reputation || ""}
                                                onChange={(e) => handleInputChange("reputation", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="background">Background</Label>
                                            <Textarea
                                                id="background"
                                                value={displayPersona.background || ""}
                                                onChange={(e) => handleInputChange("background", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstImpression">First Impression</Label>
                                            <Textarea
                                                id="firstImpression"
                                                value={displayPersona.firstImpression || ""}
                                                onChange={(e) => handleInputChange("firstImpression", e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                            />
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Persona Selected</h3>
                            <p className="text-gray-500">Select a persona from the list or add a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
