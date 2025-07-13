import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Relationship } from "@/lib/store"

interface RelationshipDisplayProps {
    characterName: string
    relationship: Relationship
}

interface BarProps {
    label: string
    value: number
    max?: number
}

function RelationshipBar({ label, value, max = 100 }: BarProps) {
    const percentage = (Math.abs(value) / max) * 100
    const isPositive = value >= 0

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{label.replace("_", " ")}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">
                        {value > 0 ? "+" : ""}
                        {value}
                    </span>
                </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${isPositive ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default function RelationshipDisplay({ characterName, relationship }: RelationshipDisplayProps) {
    return (
        <Card className="w-80 h-fit max-h-[80vh] overflow-y-auto">
            <CardHeader>
                <CardTitle>Relationship with {characterName}</CardTitle>
                <CardDescription>Emotional and interpersonal dynamics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <RelationshipBar label="closeness" value={relationship.closeness} />
                    <RelationshipBar
                        label="sexual_attraction"
                        value={relationship.sexual_attraction}
                    />
                    <RelationshipBar label="respect" value={relationship.respect} />
                    <RelationshipBar label="engagement" value={relationship.engagement} />
                    <RelationshipBar label="stability" value={relationship.stability} />
                </div>

                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{relationship.description}</p>
                </div>
            </CardContent>
        </Card>
    )
}
