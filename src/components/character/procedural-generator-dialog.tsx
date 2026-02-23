import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Database, User, MapPin, Briefcase, Activity } from "lucide-react";
import { useEntityStore } from '@/lib/entityStore';
import { BioState } from '@/lib/generator/types';
import { Badge } from "@/components/ui/badge";

interface ProceduralGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    characterId: string;
}

export function ProceduralGeneratorDialog({ open, onOpenChange, characterId }: ProceduralGeneratorDialogProps) {
    const { characters } = useEntityStore();
    const currentCharacter = useMemo(() => characters.find(c => c.id === characterId), [characters, characterId]);

    const bioState = currentCharacter?.generationMeta as BioState | undefined;
    const info = currentCharacter?.basicInfo;

    if (!currentCharacter || !info) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Generation Report: {info.name}
                    </DialogTitle>
                    <DialogDescription>
                        Read-only view of the simulation data and faker constraints used to generate this character.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 pt-4 flex flex-col gap-6 overflow-hidden">
                    {/* Top Stats Bar */}
                    <div className="grid grid-cols-4 gap-4 p-4 rounded-lg border bg-muted/40">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><User className="w-3 h-3" /> Demographics</p>
                            <p className="text-sm font-medium">{info.age} years old, {info.gender}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Briefcase className="w-3 h-3" /> Role</p>
                            <p className="text-sm font-medium">{info.role || 'Unassigned'}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Origin Location</p>
                            <p className="text-sm font-medium">
                                {[info.originLocation?.town, info.originLocation?.stateRegion, info.originLocation?.country].filter(Boolean).join(', ') || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="simulation" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full justify-start border-b rounded-none pb-0 h-auto bg-transparent">
                            <TabsTrigger value="simulation" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-2">
                                <Activity className="w-4 h-4 mr-2" />
                                Bio Simulation Data
                            </TabsTrigger>
                            <TabsTrigger value="narrative" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-2">
                                <FileText className="w-4 h-4 mr-2" />
                                Narrative Result
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="simulation" className="flex-1 overflow-hidden mt-4">
                            {bioState ? (
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                The Spine (Life Path Stages)
                                            </h4>
                                            <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                                                {bioState.spine.map((node, i) => (
                                                    <div key={i} className="relative">
                                                        <div className="absolute w-2 h-2 rounded-full bg-primary/50 -left-[21px] top-2" />
                                                        <div className="bg-card p-3 rounded-md border shadow-sm">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase">{node.slot}</span>
                                                                <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{node.id}</code>
                                                            </div>
                                                            <p className="text-sm">{node.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-secondary" />
                                                The Flesh (Specific Events)
                                            </h4>
                                            {bioState.flesh.length === 0 ? (
                                                <p className="text-sm text-muted-foreground italic pl-4">No significant discrete events recorded.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                                    {bioState.flesh.map((event, i) => (
                                                        <div key={i} className="text-sm p-3 bg-secondary/10 border rounded flex flex-col gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline" className="text-[10px] uppercase font-mono bg-background">
                                                                    {event.generatedPhase || 'UNKNOWN'}
                                                                </Badge>
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={event.id}>{event.id}</span>
                                                            </div>
                                                            <span className="text-foreground leading-snug">{event.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 pb-6">
                                            <h4 className="font-semibold mb-3 text-primary">Generated Tags</h4>
                                            <div className="flex flex-wrap gap-1.5 pl-4">
                                                {Array.from(bioState.tags || []).map(t => (
                                                    <Badge key={t as string} variant="secondary" className="font-normal">{t as string}</Badge>
                                                ))}
                                                {(!bioState.tags || Array.from(bioState.tags).length === 0) && <span className="text-sm text-muted-foreground italic">No tags generated.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                    <Database className="w-8 h-8 opacity-20" />
                                    <p>No biological simulation data available for this character.</p>
                                    <p className="text-xs opacity-70">This could be because they were created manually or before this feature was added.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="narrative" className="flex-1 overflow-hidden mt-4">
                            <ScrollArea className="h-full pr-4">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground bg-card border rounded-md p-6 shadow-sm">
                                    {info.background ? (
                                        info.background.split('\n').map((cat, i) => <p key={i} className="leading-relaxed min-h-[1.5em]">{cat}</p>)
                                    ) : (
                                        <p className="text-muted-foreground italic text-center gap-2 flex flex-col items-center mt-10">
                                            <FileText className="w-8 h-8 opacity-20" />
                                            No narrative background available.
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

