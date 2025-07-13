"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RelationshipValues {
    closeness: number
    sexual_attraction: number
    respect: number
    engagement: number
    stability: number
}

interface RelationshipDisplayProps {
    currentValues: RelationshipValues
    deltaValues: RelationshipValues
    description: string
}

interface BarProps {
    label: string
    value: number
    delta?: number
    max?: number
}

function RelationshipBar({ label, value, delta = 0, max = 100 }: BarProps) {
    const percentage = (Math.abs(value) / max) * 100
    const isPositive = value >= 0
    const deltaIsPositive = delta >= 0

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{label.replace("_", " ")}</span>
                <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">
            {value > 0 ? "+" : ""}
              {value}
          </span>
                    {delta !== 0 && (
                        <span
                            className={`text-xs font-mono px-2 py-1 rounded-full border ${
                                deltaIsPositive
                                    ? "text-green-700 bg-green-50 border-green-200"
                                    : "text-red-700 bg-red-50 border-red-200"
                            }`}
                        >
              {deltaIsPositive ? "+" : ""}
                            {delta}
            </span>
                    )}
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

export default function Component({ currentValues, deltaValues, description }: RelationshipDisplayProps) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Relationship Analysis</CardTitle>
                <CardDescription>Emotional and interpersonal dynamics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <RelationshipBar label="closeness" value={currentValues.closeness} delta={deltaValues.closeness} />
                    <RelationshipBar
                        label="sexual_attraction"
                        value={currentValues.sexual_attraction}
                        delta={deltaValues.sexual_attraction}
                    />
                    <RelationshipBar label="respect" value={currentValues.respect} delta={deltaValues.respect} />
                    <RelationshipBar label="engagement" value={currentValues.engagement} delta={deltaValues.engagement} />
                    <RelationshipBar label="stability" value={currentValues.stability} delta={deltaValues.stability} />
                </div>

                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}