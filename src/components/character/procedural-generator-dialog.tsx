import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, User, BookOpen, Loader2 } from "lucide-react";

import { NameGenerator, SupportedCountry, GenderOption, Identity } from '@/lib/generator/NameGenerator';
import { BioMachine, BioState, BioGenerationRequest, EventNode } from '@/lib/generator/BioMachine';
import originsData from '@/lib/generator/data/origins.json';
import careersData from '@/lib/generator/data/careers.json';

interface ProceduralGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (data: { name: string; age: number; gender: string; background: string; origin: string; role: string; avatar?: string }) => void;
    characterId: string;
}

export function ProceduralGeneratorDialog({ open, onOpenChange, onApply }: ProceduralGeneratorDialogProps) {
    // State
    const [country, setCountry] = useState<SupportedCountry>('USA');
    const [selectedState, setSelectedState] = useState<string>('random');
    const [selectedGender, setSelectedGender] = useState<'random' | GenderOption>('random');
    const [age, setAge] = useState<number>(30);
    const [mode, setMode] = useState<'random' | 'custom'>('random');
    const [targetOrigin, setTargetOrigin] = useState<string>('random');
    const [targetCareer, setTargetCareer] = useState<string>('random');

    // Generated Data State
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [bioState, setBioState] = useState<BioState | null>(null);
    const [generatedBioText, setGeneratedBioText] = useState<string>('');

    // Loading States
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    // Persistence State
    const [hasLoaded, setHasLoaded] = useState(false);

    // Constants
    const SETTINGS_KEY = 'parley_proc_gen_settings';
    const machine = useMemo(() => new BioMachine(), []);
    const origins = originsData as EventNode[];
    const careers = careersData as EventNode[];

    // Effects
    useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.country) setCountry(parsed.country);
                if (parsed.selectedState) setSelectedState(parsed.selectedState);
                if (parsed.selectedGender) setSelectedGender(parsed.selectedGender);
                if (parsed.age) setAge(parsed.age);
                if (parsed.mode) setMode(parsed.mode);
                if (parsed.targetOrigin) setTargetOrigin(parsed.targetOrigin);
                if (parsed.targetCareer) setTargetCareer(parsed.targetCareer);
            } catch (e) {
                console.error("Failed to parse saved settings", e);
            }
        }
        setHasLoaded(true);
    }, []);

    useEffect(() => {
        if (!hasLoaded) return;
        const settings = {
            country,
            selectedState,
            selectedGender,
            age,
            mode,
            targetOrigin,
            targetCareer
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [hasLoaded, country, selectedState, selectedGender, age, mode, targetOrigin, targetCareer]);

    // Handlers
    const handleGenerateIdentity = () => {
        const genderArg = selectedGender === 'random' ? undefined : selectedGender;
        const stateArg = selectedState === 'random' ? undefined : selectedState;
        const id = NameGenerator.generateIdentity(country, genderArg, stateArg);
        setIdentity(id);
    };

    const handleGenerateHistory = () => {
        const request: BioGenerationRequest = {
            age,
            targetOriginId: targetOrigin === 'random' ? undefined : targetOrigin,
            targetCareerId: targetCareer === 'random' ? undefined : targetCareer,
        };
        const result = machine.generate(request);
        setBioState(result);
    };

    const handleWriteBio = async () => {
        if (!identity || !bioState) return;

        setIsGeneratingBio(true);
        try {
            const response = await fetch('/api/generate/bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identity: { ...identity, country },
                    spine: bioState.spine,
                    flesh: bioState.flesh,
                    aiStyle: 'Standard' // Could be passed from props
                })
            });

            const data = await response.json();
            if (data.bio) {
                setGeneratedBioText(data.bio);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleApply = () => {
        if (!identity) return;

        // Determine Role from career if available
        const role = bioState?.spine.find(n => n.slot === 'CAREER')?.id.replace(/_/g, ' ') || 'Unknown';
        const origin = bioState?.spine.find(n => n.slot === 'ORIGIN')?.id.replace(/_/g, ' ') || 'Unknown';

        onApply({
            name: `${identity.firstName} ${identity.lastName}`,
            gender: identity.gender,
            age: age,
            background: generatedBioText,
            origin: origin,
            role: role.charAt(0).toUpperCase() + role.slice(1)
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5" />
                        Procedural Character Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate a unique character back-story based on simulation logic.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    {/* LEFT COLUMN: Controls */}
                    <div className="col-span-4 space-y-6 border-r pr-6 pb-6 overflow-y-auto">

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">1. Identity Settings</h3>
                            <div className="space-y-2">
                                <Label>Country of Origin</Label>
                                <Select value={country} onValueChange={(v: any) => {
                                    setCountry(v);
                                    setSelectedState('random');
                                }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(['USA', 'UK', 'Japan', 'France', 'Germany', 'Italy', 'Spain', 'China', 'Russia'] as SupportedCountry[]).map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* State/Region Selection */}
                            {useMemo(() => {
                                const states = NameGenerator.getStates(country);
                                if (!states || states.length === 0) return null;

                                return (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label>State / Region</Label>
                                        <Select value={selectedState} onValueChange={setSelectedState}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Random" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                <SelectItem value="random">Random</SelectItem>
                                                {states.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }, [country, selectedState])}

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <RadioGroup value={selectedGender} onValueChange={(v: any) => setSelectedGender(v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="random" id="g-random" />
                                        <Label htmlFor="g-random">Random</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" id="g-male" />
                                        <Label htmlFor="g-male">Male</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" id="g-female" />
                                        <Label htmlFor="g-female">Female</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Age</Label>
                                <Input type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={18} max={90} />
                            </div>

                            <Button onClick={handleGenerateIdentity} className="w-full" variant="secondary">
                                <User className="w-4 h-4 mr-2" /> Generate Identity
                            </Button>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">2. Life Path Settings</h3>

                            <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="random" id="r-random" />
                                    <Label htmlFor="r-random">Random</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="r-custom" />
                                    <Label htmlFor="r-custom">Custom</Label>
                                </div>
                            </RadioGroup>

                            {mode === 'custom' && (
                                <div className="space-y-3 pl-2 border-l-2 border-muted">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Target Origin</Label>
                                        <Select value={targetOrigin} onValueChange={setTargetOrigin}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="random">Random</SelectItem>
                                                {origins.map(o => (
                                                    <SelectItem key={o.id} value={o.id}>{o.id.replace(/_/g, ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Target Career</Label>
                                        <Select value={targetCareer} onValueChange={setTargetCareer}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="random">Random</SelectItem>
                                                {careers.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.id.replace(/_/g, ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <Button onClick={handleGenerateHistory} className="w-full" variant="secondary">
                                <BookOpen className="w-4 h-4 mr-2" /> Simulate History
                            </Button>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="col-span-8 flex flex-col min-h-0 gap-4">

                        {/* Identity Card */}
                        {identity && (
                            <div className="bg-muted p-4 rounded-lg border flex justify-between items-center">
                                <div>
                                    <div className="text-xl font-bold text-foreground">{identity.firstName} {identity.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{identity.gender} • {identity.location}</div>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                    ID: {Math.random().toString(36).substr(2, 9)}
                                </div>
                            </div>
                        )}

                        {/* Tabs for History / Bio */}
                        <Tabs defaultValue="history" className="flex-1 flex flex-col min-h-0">
                            <TabsList>
                                <TabsTrigger value="history">Life Path Simulation</TabsTrigger>
                                <TabsTrigger value="narrative" disabled={!generatedBioText}>Narrative Bio</TabsTrigger>
                            </TabsList>

                            <TabsContent value="history" className="flex-1 min-h-0 border rounded-md p-0 overflow-hidden relative">
                                {!bioState ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                                        Run simulation to see life path
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full p-4">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-primary">The Spine (Core Path)</h4>
                                                <div className="flex flex-col gap-2">
                                                    {bioState.spine.map((node, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-2 bg-card border rounded shadow-sm">
                                                            <span className="text-xs font-bold w-20 uppercase text-muted-foreground">{node.slot}</span>
                                                            <span className="font-medium text-card-foreground">{node.id.replace(/_/g, ' ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2 text-primary">The Flesh (Life Events)</h4>
                                                <div className="space-y-2">
                                                    {bioState.flesh.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">No significant events recorded.</p>
                                                    ) : (
                                                        bioState.flesh.map((event, i) => (
                                                            <div key={i} className="text-sm p-2 bg-accent/20 border border-border rounded text-foreground">
                                                                • {event.text}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2 text-primary">Tags</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from(bioState.tags).map(t => (
                                                        <span key={t} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full border">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                )}
                            </TabsContent>

                            <TabsContent value="narrative" className="flex-1 min-h-0 border rounded-md p-4 overflow-y-auto">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                                    {generatedBioText.split('\n').map((cat, i) => <p key={i}>{cat}</p>)}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between pt-4 border-t">
                            <div className="text-xs text-muted-foreground flex items-center">
                                {isGeneratingBio && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {isGeneratingBio ? 'Writing biography...' : ''}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleWriteBio}
                                    disabled={!bioState || !identity || isGeneratingBio}
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Rewrite Bio (LLM)
                                </Button>
                                <Button onClick={handleApply} disabled={!identity}>
                                    Apply to Character
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
