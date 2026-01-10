
import { cn } from "@/lib/utils";
import { Relationship } from "@/lib/types";

interface RelationshipBarProps {
    relationship?: Relationship;
    className?: string;
}

export function RelationshipBar({ relationship, className }: RelationshipBarProps) {
    if (!relationship) {
        return (
            <div className={cn("w-full h-2 bg-secondary rounded-full overflow-hidden", className)}>
                <div
                    className="h-full bg-muted-foreground/20"
                    style={{ width: '0%' }}
                />
            </div>
        );
    }

    // Calculate sum of 5 traits (0-100 each)
    const totalScore = (
        relationship.satisfaction +
        relationship.commitment +
        relationship.intimacy +
        relationship.trust +
        relationship.passion
    );

    // Normalize to 0-100 for display (Average)
    // Formula: (Sum / 500) * 100 which simplifies to Sum / 5
    const normalizedScore = Math.min(100, Math.max(0, totalScore / 5));

    // Determine color based on score
    let colorClass = "bg-primary";
    if (normalizedScore < 30) colorClass = "bg-destructive";
    else if (normalizedScore < 60) colorClass = "bg-yellow-500";
    else if (normalizedScore >= 80) colorClass = "bg-green-500";

    return (
        <div className={cn("w-full space-y-1", className)}>
            <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>Relationship</span>
                <span>{Math.round(normalizedScore)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500 ease-in-out", colorClass)}
                    style={{ width: `${normalizedScore}%` }}
                />
            </div>
        </div>
    );
}
