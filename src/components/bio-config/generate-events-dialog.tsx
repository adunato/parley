import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventNode, LifeEvent, Tag, AgePhase } from '@/lib/generator/types';
import { useBioStore } from '@/lib/store/bioStore';
import { AlertCircle, CheckCircle2, Loader2, Plus, Sparkles } from 'lucide-react';

interface GenerateEventsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceEntity?: EventNode | LifeEvent;
    type?: 'CHILDHOOD' | 'FORMATIVE' | 'PROFESSIONAL' | 'SENIOR' | 'LIFE_EVENT';
    phase?: AgePhase;
}

export function GenerateEventsDialog({ open, onOpenChange, sourceEntity, type, phase }: GenerateEventsDialogProps) {
    const [count, setCount] = useState(3);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [generatedEvents, setGeneratedEvents] = useState<(LifeEvent | EventNode)[]>([]);
    const [newTags, setNewTags] = useState<Tag[]>([]);

    const addLifeEvent = useBioStore(state => state.addLifeEvent);
    const addChildhood = useBioStore(state => state.addChildhood);
    const addFormative = useBioStore(state => state.addFormative);
    const addProfessional = useBioStore(state => state.addProfessional);
    const addSenior = useBioStore(state => state.addSenior);

    const addTag = useBioStore(state => state.addTag);
    const existingLifeEvents = useBioStore(state => state.lifeEvents);
    const existingTags = useBioStore(state => state.tags);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Decide which API to call. For now, we'll use a single one but pass type/phase
            const res = await fetch('/api/bio-config/generate-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceEntity,
                    count,
                    existingEvents: existingLifeEvents,
                    userPrompt: prompt,
                    type,
                    phase
                })
            });
            const data = await res.json();
            if (data.events) {
                setGeneratedEvents(data.events);
                setNewTags(data.newTags || []);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (e) {
            console.error(e);
            setError("Failed to connect to generation service.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (event: LifeEvent | EventNode) => {
        // 1. Add the event to the correct store
        if (type === 'CHILDHOOD') {
            addChildhood({ ...(event as EventNode), slot: 'CHILDHOOD', phase: phase || 'Childhood' });
        } else if (type === 'FORMATIVE') {
            addFormative({ ...(event as EventNode), slot: 'FORMATIVE', phase: phase || 'Formative' });
        } else if (type === 'PROFESSIONAL') {
            addProfessional({ ...(event as EventNode), slot: 'PROFESSIONAL', phase: phase || 'Professional' });
        } else if (type === 'SENIOR') {
            addSenior({ ...(event as EventNode), slot: 'SENIOR', phase: phase || 'Senior' });
        } else {
            addLifeEvent(event as LifeEvent);
        }

        // 2. Add used tags if they are new
        const usedTagIds = new Set<string>();
        event.provides?.forEach(t => usedTagIds.add(t));
        if (event.weights) {
            Object.keys(event.weights).forEach(t => {
                if (t !== 'DEFAULT') usedTagIds.add(t);
            });
        }

        const tagsToAdd = newTags.filter(t => usedTagIds.has(t.id) && !existingTags.some(et => et.id === t.id));
        tagsToAdd.forEach(t => addTag(t));

        // 3. Feedback
        setGeneratedEvents(prev => prev.filter(e => e.id !== event.id));
        setSuccess(`Added "${event.text}" to dataset.`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
    };

    const isLifeEvent = type === 'LIFE_EVENT' || !type;
    const titleText = isLifeEvent ? "Generate Life Events" : `Generate ${phase} Milestones`;
    const descriptionText = sourceEntity
        ? `Generating connected to: ${sourceEntity.text}`
        : isLifeEvent ? "Generating independent life events." : `Generating new ${phase} spine nodes.`;

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) {
                setGeneratedEvents([]);
                setNewTags([]);
                setError(null);
                setSuccess(null);
            }
            onOpenChange(o);
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        {titleText}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {descriptionText}
                    </p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Success Display */}
                    {success && (
                        <div className="bg-green-500/10 text-green-600 p-3 rounded-md flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {success}
                        </div>
                    )}

                    {/* Input Section - Hide if reviewing generated events */}
                    {generatedEvents.length === 0 && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Number of Events</Label>
                                    <Input
                                        type="number"
                                        value={count}
                                        onChange={e => setCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                                        min={1}
                                        max={10}
                                    />
                                    <p className="text-xs text-muted-foreground">Between 1 and 10.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Custom Instructions (Optional)</Label>
                                <Textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="e.g. Focus on tragic outcomes, or events involving travel..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </>
                    )}

                    {/* Results Section */}
                    {generatedEvents.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Generated Events ({generatedEvents.length} remaining)</h3>
                                <Button variant="ghost" size="sm" onClick={() => { setGeneratedEvents([]); setNewTags([]); }}>Clear & Restart</Button>
                            </div>

                            <div className="space-y-3">
                                {generatedEvents.map(event => (
                                    <div key={event.id} className="border p-4 rounded-lg bg-card text-card-foreground shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <p className="font-medium text-lg">{event.text}</p>
                                                <div className="flex gap-2 text-xs text-muted-foreground font-mono">
                                                    <span>ID: {event.id}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => handleAccept(event)}>
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs bg-muted/50 p-2 rounded">
                                            <div>
                                                <span className="font-semibold text-muted-foreground">Provides:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {event.provides?.length ? event.provides.map(t => (
                                                        <span key={t} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
                                                    )) : <span className="text-muted-foreground italic">None</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-muted-foreground">Weights:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(event.weights).map(([k, v]) => (
                                                        <span key={k} className="bg-secondary px-1.5 py-0.5 rounded">{k}: {v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {newTags.length > 0 && (
                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Discovered New Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {newTags.map(tag => (
                                            <div key={tag.id} title={tag.description} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded shadow-sm">
                                                {tag.id}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-indigo-600 mt-2 italic">These tags will be added to your library when you accept an event that uses them.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {generatedEvents.length === 0 ? (
                        <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Generating...' : isLifeEvent ? 'Generate Events' : 'Generate Milestones'}
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
