import { Persona } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PersonaCardProps {
    persona: Persona;
    onClick?: () => void;
    isSelected?: boolean;
    className?: string;
}

export function PersonaCard({ persona, onClick, isSelected, className }: PersonaCardProps) {
    const { name, role, age, avatar } = persona.basicInfo;

    return (
        <Card
            className={cn(
                "w-[280px] cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group border-2",
                isSelected ? "border-primary shadow-md bg-accent/50" : "border-border hover:border-primary/50",
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="flex flex-col items-center pb-2 pt-6">
                <Avatar className="h-24 w-24 border-2 border-border mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage src={avatar} alt={name} className="object-cover" />
                    <AvatarFallback className="text-2xl font-display">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                    <h3 className="font-display font-bold text-xl tracking-wide">{name}</h3>
                    <Badge variant="outline" className="font-sans text-xs uppercase tracking-wider bg-background/50">{role}</Badge>
                </div>
            </CardHeader>
            <CardContent className="text-center pb-6">
                <div className="text-sm text-muted-foreground font-sans">
                    <span className="font-semibold text-foreground">Age:</span> {age}
                </div>
                {/* Visual flair: decorative element */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity",
                    isSelected ? "opacity-100" : "group-hover:opacity-100"
                )} />
            </CardContent>
        </Card>
    );
}
