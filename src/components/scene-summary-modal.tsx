
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PRQC } from '@/lib/types';
import { ArrowRight, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

interface SceneSummaryModalProps {
    isOpen: boolean;
    isLoading?: boolean;
    onClose: () => void;
    relationshipDelta: PRQC | null;
    analysisDescription: string | null;
    sceneSummary: string | null;
    appliedTraits?: string[];
}

export function SceneSummaryModal({
    isOpen,
    isLoading = false,
    onClose,
    relationshipDelta,
    analysisDescription,
    sceneSummary,
    appliedTraits = []
}: SceneSummaryModalProps) {

    const renderDelta = (label: string, value: number) => {
        if (value === 0) return null;
        const isPositive = value > 0;
        return (
            <div className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                <span className="text-muted-foreground font-medium uppercase tracking-wide text-xs">{label}</span>
                <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    <span className="font-bold font-mono">{isPositive ? '+' : ''}{value}</span>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm border-border">
                <DialogHeader>
                    <DialogTitle className="font-display uppercase tracking-wider text-xl text-foreground">Scene Complete</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground uppercase tracking-wide font-bold">Analyzing conversation and updating relationship...</p>
                        </div>
                    ) : (
                        <>
                            {/* Scene Summary Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Summary</h3>
                                <div className="h-[100px] w-full rounded-md border border-border p-2 bg-muted/20 overflow-y-auto">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {sceneSummary || "No summary available for this scene."}
                                    </p>
                                </div>
                            </div>

                            {/* Behavioral Analysis (Traits Table) */}
                            {appliedTraits && appliedTraits.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Behavioral Analysis</h3>
                                    <div className="rounded-md border border-border overflow-hidden text-sm">
                                        <div className="bg-muted/50 px-3 py-2 border-b border-border font-bold uppercase text-[10px] tracking-wider text-muted-foreground">
                                            Detected Traits & Impacts
                                        </div>
                                        <div className="divide-y divide-border bg-card">
                                            {appliedTraits.map((traitStr, idx) => (
                                                <div key={idx} className="px-3 py-2 flex items-center justify-between">
                                                    <span className="text-foreground">{traitStr.split('(')[0].trim()}</span>
                                                    <span className={`font-mono font-medium ${traitStr.includes('+') ? 'text-green-600' : 'text-destructive'}`}>
                                                        {traitStr.match(/\((.*?)\)/)?.[1] || traitStr}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Relationship Impact Section */}
                            {relationshipDelta && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Relationship Statistics</h3>
                                    <div className="rounded-md border border-border p-3 bg-card shadow-sm">
                                        {renderDelta("Satisfaction", relationshipDelta.satisfaction)}
                                        {renderDelta("Commitment", relationshipDelta.commitment)}
                                        {renderDelta("Intimacy", relationshipDelta.intimacy)}
                                        {renderDelta("Trust", relationshipDelta.trust)}
                                        {renderDelta("Passion", relationshipDelta.passion)}

                                        {Object.values(relationshipDelta).every(v => v === 0) && (
                                            <div className="text-center text-muted-foreground text-sm py-2">
                                                <Minus className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                                No significant changes.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Events Log (Description) */}
                            {analysisDescription && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Major Events</h3>
                                    <div className="p-3 bg-primary/5 rounded-md border border-primary/20 text-xs text-foreground/80">
                                        <p className="whitespace-pre-wrap">{analysisDescription.replace(/RELATIONSHIP UPDATE:[\s\S]*/, '').trim()}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full sm:w-auto uppercase tracking-wide font-bold" disabled={isLoading}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
