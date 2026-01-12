import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventNode, LifeEvent } from '@/lib/generator/types';
import { useBioStore } from '@/lib/store/bioStore';
import { Loader2, Plus, Sparkles } from 'lucide-react';

interface GenerateEventsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceEntity: EventNode | LifeEvent;
}

export function GenerateEventsDialog({ open, onOpenChange, sourceEntity }: GenerateEventsDialogProps) {
    const [count, setCount] = useState(3);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedEvents, setGeneratedEvents] = useState<LifeEvent[]>([]);
    const addLifeEvent = useBioStore(state => state.addLifeEvent);
    const existingLifeEvents = useBioStore(state => state.lifeEvents);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bio-config/generate-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceEntity,
                    count,
                    existingEvents: existingLifeEvents,
                    userPrompt: prompt
                })
            });
            const data = await res.json();
            if (data.events) {
                setGeneratedEvents(data.events);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (event: LifeEvent) => {
        addLifeEvent(event);
        setGeneratedEvents(prev => prev.filter(e => e.id !== event.id));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Generate Life Events
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Generating events connected to: <span className="font-medium text-foreground">{sourceEntity.text}</span>
                    </p>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
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
                                <Button variant="ghost" size="sm" onClick={() => setGeneratedEvents([])}>Clear & Restart</Button>
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
                        </div>
                    )}
                </div>

                <DialogFooter>
                     {generatedEvents.length === 0 ? (
                        <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Generating...' : 'Generate Events'}
                        </Button>
                     ) : (
                        <Button variant="outline" onClick={() => { setGeneratedEvents([]); onOpenChange(false); }}>Done</Button>
                     )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
