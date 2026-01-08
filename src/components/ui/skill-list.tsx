import React from "react";

interface SkillListProps {
    skills: Record<string, number | null>;
    className?: string; // Added for flexibility though not strictly used in internal mapping yet
}

export const SkillList = ({ skills }: SkillListProps) => (
    <div className="space-y-1">
        {Object.entries(skills).map(([skill, value]) => (
            <div key={skill} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0 hover:bg-muted/50 px-2 rounded-sm cursor-default">
                <span className="font-medium font-display tracking-tight text-foreground/90 uppercase">{skill}</span>
                <span className="text-muted-foreground font-sans">{value === null ? "–" : "•".repeat(value)}</span>
            </div>
        ))}
    </div>
);
