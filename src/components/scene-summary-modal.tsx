
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
}

export function SceneSummaryModal({
    isOpen,
    isLoading = false,
    onClose,
    relationshipDelta,
    analysisDescription,
    sceneSummary
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
            <DialogContent className="sm:max-w-md">
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

                            {/* Analysis Section */}
                            {analysisDescription && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-900">Analyst Report</h3>
                                    <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                        <p className="text-sm text-blue-800 italic">"{analysisDescription}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Relationship Impact Section */}
                            {relationshipDelta && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-900">Relationship Impact</h3>
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
