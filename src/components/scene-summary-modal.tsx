
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
            <div className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 font-medium">{label}</span>
                <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    <span className="font-bold">{isPositive ? '+' : ''}{value}</span>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Scene Complete</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-500">Analyzing conversation and updating relationship...</p>
                        </div>
                    ) : (
                        <>
                            {/* Scene Summary Section */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
                                <div className="h-[100px] w-full rounded-md border p-2 bg-gray-50 overflow-y-auto">
                                    <p className="text-sm text-gray-600">
                                        {sceneSummary || "No summary available for this scene."}
                                    </p>
                                </div>
                            </div>

                            {/* Behavioral Analysis (Traits Table) */}
                            {appliedTraits && appliedTraits.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-900">Behavioral Analysis</h3>
                                    <div className="rounded-md border border-gray-200 overflow-hidden text-sm">
                                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 font-medium text-gray-500">
                                            Detected Traits & Impacts
                                        </div>
                                        <div className="divide-y divide-gray-100 bg-white">
                                            {appliedTraits.map((traitStr, idx) => (
                                                <div key={idx} className="px-3 py-2 flex items-center justify-between">
                                                    <span className="text-gray-800">{traitStr.split('(')[0].trim()}</span>
                                                    <span className={`font-mono font-medium ${traitStr.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
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
                                    <h3 className="text-sm font-semibold text-gray-900">Relationship Statistics</h3>
                                    <div className="rounded-md border p-3 bg-white shadow-sm">
                                        {renderDelta("Satisfaction", relationshipDelta.satisfaction)}
                                        {renderDelta("Commitment", relationshipDelta.commitment)}
                                        {renderDelta("Intimacy", relationshipDelta.intimacy)}
                                        {renderDelta("Trust", relationshipDelta.trust)}
                                        {renderDelta("Passion", relationshipDelta.passion)}

                                        {Object.values(relationshipDelta).every(v => v === 0) && (
                                            <div className="text-center text-gray-400 text-sm py-2">
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
                                    <h3 className="text-sm font-semibold text-gray-900">Major Events</h3>
                                    <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-800">
                                        <p className="whitespace-pre-wrap">{analysisDescription.replace(/RELATIONSHIP UPDATE:[\s\S]*/, '').trim()}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full sm:w-auto" disabled={isLoading}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
