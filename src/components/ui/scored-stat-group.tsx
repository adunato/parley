import React from "react";

interface ScoredStatGroupProps {
    title: string;
    children: React.ReactNode;
}

export const ScoredStatGroup = ({ title, children }: ScoredStatGroupProps) => (
    <div>
        <div className="mb-3 px-1 text-lg font-display font-medium uppercase tracking-wider text-muted-foreground border-b pb-1">
            {title}
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);
