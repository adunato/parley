import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkillGroupProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const SkillGroup = ({ title, children, className }: SkillGroupProps) => (
    <div className={className}>
        <div className="mb-2 px-1 text-lg font-display font-medium uppercase tracking-wider text-muted-foreground">
            {title}
        </div>
        <Card className="rounded-sm shadow-sm border-0 bg-white dark:bg-card">
            <CardContent className="pt-4 grid grid-cols-2 gap-x-6">
                {children}
            </CardContent>
        </Card>
    </div>
);
