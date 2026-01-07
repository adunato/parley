import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    className?: string;
}

export const SectionHeader = ({ title, className }: SectionHeaderProps) => (
    <div className={cn("relative flex items-center justify-center mb-2 mt-2", className)}>
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative bg-[#f3f4f6] dark:bg-background px-4 text-xl font-display font-medium uppercase tracking-widest text-muted-foreground/80">
            {title}
        </div>
    </div>
);
