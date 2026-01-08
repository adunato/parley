import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatBox } from "@/components/ui/stat-box";
import { cn } from "@/lib/utils";

interface ScoredStatCardProps {
    label: string;
    value: number;
    max?: number;
    className?: string;
}

export const ScoredStatCard = ({ label, value, max = 5, className }: ScoredStatCardProps) => (
    <Card className={cn("rounded-sm shadow-sm border-0 border-l-4 border-l-gray-300 dark:border-l-muted bg-white dark:bg-card", className)}>
        <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between py-1">
                <span className="text-sm font-semibold font-display uppercase tracking-tight text-foreground/80">{label}</span>
                <div className="flex gap-1">
                    {Array.from({ length: max }).map((_, i) => (
                        <StatBox key={i} filled={i < value} />
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);
