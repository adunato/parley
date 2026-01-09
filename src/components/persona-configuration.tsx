import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, Plus, Sparkles, Type, Upload, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useParleyStore } from "@/lib/store"
import { Persona } from "@/lib/types";
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
import { useEntityStore } from "@/lib/entityStore";
import { SectionHeader } from "@/components/ui/section-header";
import { useDebouncedCallback } from "use-debounce";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function PersonaConfiguration() {
    const { worldDescription, aiStyle, _hasHydrated, avatarGenerationSettings } = useParleyStore()
    const { playerPersonas, addPlayerPersona, updatePlayerPersona, deletePlayerPersona } = useEntityStore()

    // Selection State
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Local Buffer State
    const [localPersona, setLocalPersona] = useState<Persona | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const isDirtyRef = useRef(false);

    // Dialog States
    const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
    const [isPersonaPromptDialogOpen, setIsPersonaPromptDialogOpen] = useState(false);
    const [dialogPersonaPrompt, setDialogPersonaPrompt] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isAvatarPromptDialogOpen, setIsAvatarPromptDialogOpen] = useState(false);
    const [dialogAvatarPrompt, setDialogAvatarPrompt] = useState('');

    // Debounced Save
    const debouncedSave = useDebouncedCallback((persona: Persona) => {
        setSaveStatus('saving');
        try {
            updatePlayerPersona(persona);
            setSaveStatus('saved');
            isDirtyRef.current = false;
            setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
        } catch (error) {
            console.error("Failed to save persona", error);
            setSaveStatus('error');
        }
    }, 1000);

    // Sync selected logic
    const selectedPersonaStore = playerPersonas.find((p) => p.id === selectedId)

    useEffect(() => {
        if (selectedPersonaStore) {
            if (!isDirtyRef.current || localPersona?.id !== selectedPersonaStore.id) {
                setLocalPersona({ ...selectedPersonaStore });
            }
        } else {
            if (!selectedId) {
                setLocalPersona(null);
                if (playerPersonas.length > 0) {
                    setSelectedId(playerPersonas[0].id);
                }
            }
        }
    }, [selectedPersonaStore, playerPersonas, selectedId]);

    const handleSelect = (persona: Persona) => {
        if (localPersona && isDirtyRef.current) {
            debouncedSave.flush();
        }
        setSelectedId(persona.id)
    }

    const handleInputChange = (
        section: keyof Persona | "basicInfo",
        field: string,
        value: string | number | string[] | undefined
    ) => {
        setLocalPersona((prev) => {
            if (!prev) return null

            const newPersona = { ...prev }

            if (section === "basicInfo") {
                newPersona[section] = {
                    ...newPersona[section],
                    [field]: value,
                } as any
            } else {
                (newPersona as any)[field] = value
            }
            isDirtyRef.current = true;
            setSaveStatus('saving');
            debouncedSave(newPersona);
            return newPersona
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !localPersona) return;

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

    const handleAddPersona = () => {
        if (localPersona && isDirtyRef.current) {
            debouncedSave.flush();
        }

        const newId = `Persona-${playerPersonas.length + 1}`
        const newPersona: Persona = {
            id: newId,
            basicInfo: {
                name: "New Persona",
                age: 0,
                gender: "",
                role: "",
                faction: "",
                reputation: "",
                background: "",
                firstImpression: "",
                appearance: "",
            }
        }
        addPlayerPersona(newPersona)
        setSelectedId(newId)
        setLocalPersona(newPersona)
        isDirtyRef.current = false;
    }

    const handleDeletePersona = () => {
        if (localPersona && localPersona.id) {
            deletePlayerPersona(localPersona.id)
            setLocalPersona(null)
            if (selectedId === localPersona.id) {
                // Try to check next available or trigger useEffect to pick first
                setSelectedId(null)
            }
        }
    }

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                // If we have a local selected, update it. If not, create new?
                // Logic: If on a "New Persona" or editing one, generate INTO it.
                // The original code either updated selected OR added new.
                // Here, let's assume we always generate INTO the currently selected persona if it exists (which it should if we are seeing the button).
                if (localPersona) {
                    const generatedData = data.persona;
                    // Merge generated data
                    setLocalPersona(prev => {
                        if (!prev) return null;
                        const updated = {
                            ...prev,
                            basicInfo: {
                                ...prev.basicInfo,
                                ...generatedData.basicInfo
                            }
                        };
                        isDirtyRef.current = true;
                        setSaveStatus('saving');
                        debouncedSave(updated);
                        return updated;
                    });
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

    const handleGeneratePersona = () => generatePersona("");
    const handleGeneratePersonaWithPrompt = () => generatePersona(dialogPersonaPrompt);

    const handleGenerateAvatarDescription = async () => {
        if (!localPersona) return;
        setIsGeneratingAvatar(true);
        try {
            const response = await fetch('/api/generate/avatar-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterOrPersonaData: localPersona }),
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
        if (!localPersona || !dialogAvatarPrompt) return;
        setIsGeneratingAvatar(true);
        try {
            const imageResponse = await fetch('/api/generate/avatar-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageDescription: dialogAvatarPrompt,
                    overrides: avatarGenerationSettings
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

                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
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

    const displayPersona = localPersona;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar - Master List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="type-ui-label text-foreground">Player Personas</h2>
                        <Button size="sm" variant="outline" onClick={handleAddPersona}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                    <p className="type-body-sm text-muted-foreground mt-1">{playerPersonas.length} personas</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {playerPersonas.map((persona) => (
                        <div
                            key={persona.id}
                            onClick={() => handleSelect(persona)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === persona.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Avatar className="w-8 h-8 border-2 border-white">
                                            <AvatarImage src={persona.basicInfo.avatar} alt={persona.basicInfo.name} />
                                            <AvatarFallback>{persona.basicInfo.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="type-body-base font-medium text-foreground truncate">{persona.basicInfo.name}</h3>
                                    </div>
                                    <p className="type-body-xs text-muted-foreground truncate">{persona.id}</p>
                                    <p className="type-body-xs text-muted-foreground truncate">{persona.basicInfo.role}</p>
                                </div>
                                <Badge className="text-xs bg-gray-100 text-gray-800">{persona.basicInfo.faction}</Badge>
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
                                        <AvatarImage src={displayPersona.basicInfo.avatar} alt={displayPersona.basicInfo.name} />
                                        <AvatarFallback>{displayPersona.basicInfo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="type-h2 text-foreground">{displayPersona.basicInfo.name}</h1>
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
                                        </div>
                                        <p className="type-ui-label text-muted-foreground">
                                            {displayPersona.id} {displayPersona.basicInfo.role && `• ${displayPersona.basicInfo.role}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
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
                                                Error
                                            </span>
                                        )}
                                    </div>

                                    <Button variant="destructive" size="icon" onClick={handleDeletePersona}>
                                        <Trash2 className="w-4 h-4" />
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
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <div className="pt-6">
                                        <SectionHeader title="Basic Information" />
                                    </div>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="type-ui-label text-muted-foreground">Name</Label>
                                            <Input
                                                id="name"
                                                value={displayPersona.basicInfo.name}
                                                onChange={(e) => handleInputChange("basicInfo", "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alias" className="type-ui-label text-muted-foreground">Alias</Label>
                                            <Input
                                                id="alias"
                                                value={displayPersona.id}
                                                onChange={(e) => handleInputChange("id", "id", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="type-ui-label text-muted-foreground">Age</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={displayPersona.basicInfo.age || 0}
                                                onChange={(e) => handleInputChange("basicInfo", "age", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="type-ui-label text-muted-foreground">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={displayPersona.basicInfo.gender || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="type-ui-label text-muted-foreground">Role</Label>
                                            <Input
                                                id="role"
                                                value={displayPersona.basicInfo.role || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "role", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="faction" className="type-ui-label text-muted-foreground">Faction</Label>
                                            <Input
                                                id="faction"
                                                value={displayPersona.basicInfo.faction || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "faction", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avatar" className="type-ui-label text-muted-foreground">Avatar URL</Label>
                                            <Input
                                                id="avatar"
                                                value={displayPersona.basicInfo.avatar || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "avatar", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appearance" className="type-ui-label text-muted-foreground">Appearance</Label>
                                            <Textarea
                                                id="appearance"
                                                value={displayPersona.basicInfo.appearance || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "appearance", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Details */}
                                <Card>
                                    <div className="pt-6">
                                        <SectionHeader title="Additional Details" />
                                    </div>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reputation" className="type-ui-label text-muted-foreground">Reputation</Label>
                                            <Textarea
                                                id="reputation"
                                                value={displayPersona.basicInfo.reputation || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "reputation", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="background" className="type-ui-label text-muted-foreground">Background</Label>
                                            <Textarea
                                                id="background"
                                                value={displayPersona.basicInfo.background || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "background", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstImpression" className="type-ui-label text-muted-foreground">First Impression</Label>
                                            <Textarea
                                                id="firstImpression"
                                                value={displayPersona.basicInfo.firstImpression || ""}
                                                onChange={(e) => handleInputChange("basicInfo", "firstImpression", e.target.value)}
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
                            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="type-ui-subhead text-foreground mb-2">No Persona Selected</h3>
                            <p className="type-body-sm text-muted-foreground">Select a persona from the list or add a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}