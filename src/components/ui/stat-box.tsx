import React from "react";
import { cn } from "@/lib/utils";

interface StatBoxProps {
    filled: boolean;
    className?: string;
}

export const StatBox = ({ filled, className }: StatBoxProps) => (
    <div className={cn(
        "h-4 w-6 rounded-sm border transition-colors",
        filled
            ? "bg-[#336699] border-[#336699]"
            : "bg-transparent border-muted-foreground/30",
        className
    )} />
);
