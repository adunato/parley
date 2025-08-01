import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {Relationship} from "@/lib/types";

interface RelationshipDisplayProps {
    characterName: string
    relationship: Relationship
    cumulativeDeltaRelationship?: Relationship
    latestDeltaDescription?: string
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

export default function RelationshipDisplay({ characterName, relationship, cumulativeDeltaRelationship, latestDeltaDescription }: RelationshipDisplayProps) {
    return (
        <Card className="w-[550px] h-fit max-h-[80vh] overflow-y-auto">
            <CardHeader>
                <CardTitle>Relationship with {characterName}</CardTitle>
                <CardDescription>Emotional and interpersonal dynamics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <RelationshipBar
                        label="closeness"
                        value={relationship.closeness}
                        delta={cumulativeDeltaRelationship?.closeness}
                    />
                    <RelationshipBar
                        label="sexual_attraction"
                        value={relationship.sexual_attraction}
                        delta={cumulativeDeltaRelationship?.sexual_attraction}
                    />
                    <RelationshipBar
                        label="respect"
                        value={relationship.respect}
                        delta={cumulativeDeltaRelationship?.respect}
                    />
                    <RelationshipBar
                        label="engagement"
                        value={relationship.engagement}
                        delta={cumulativeDeltaRelationship?.engagement}
                    />
                    <RelationshipBar
                        label="stability"
                        value={relationship.stability}
                        delta={cumulativeDeltaRelationship?.stability}
                    />
                </div>

                {latestDeltaDescription && (
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Latest Change</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{latestDeltaDescription}</p>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Base Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{relationship.description}</p>
                </div>

                {relationship.chat_summaries?.length > 0 && (
                    <div className="pt-4 border-t">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Chat Summaries</AccordionTrigger>
                                <AccordionContent>
                                    {relationship.chat_summaries.map((summary, index) => (
                                        <div key={index} className="border-t pt-2 mt-2">
                                            <p className="text-sm font-semibold">{new Date(summary.timestamp).toLocaleString()}</p>
                                            <p className="text-sm">{summary.summary}</p>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
