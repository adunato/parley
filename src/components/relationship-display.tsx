import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SectionHeader } from "@/components/ui/section-header"
import { Relationship } from "@/lib/types";

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
                <span className="type-ui-label text-foreground">{label.replace("_", " ")}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">
                        {value > 0 ? "+" : ""}
                        {value}
                    </span>
                    {delta !== 0 && (
                        <span
                            className={`text-xs font-mono px-2 py-1 rounded-full border ${deltaIsPositive
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-destructive bg-destructive/10 border-destructive/20"
                                }`}
                        >
                            {deltaIsPositive ? "+" : ""}
                            {delta}
                        </span>
                    )}
                </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/50">
                <div
                    className={`h-full transition-all duration-300 ${isPositive ? "bg-green-600" : "bg-destructive"}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default function RelationshipDisplay({ characterName, relationship, cumulativeDeltaRelationship, latestDeltaDescription }: RelationshipDisplayProps) {
    return (
        <Card className="w-[550px] h-fit max-h-[80vh] overflow-y-auto border-border shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="type-h4">Relationship with {characterName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="type-body-sm text-muted-foreground mb-4">Emotional and interpersonal dynamics overview</p>

                <div className="space-y-4">
                    <RelationshipBar
                        label="satisfaction"
                        value={relationship.satisfaction}
                        delta={cumulativeDeltaRelationship?.satisfaction}
                    />
                    <RelationshipBar
                        label="commitment"
                        value={relationship.commitment}
                        delta={cumulativeDeltaRelationship?.commitment}
                    />
                    <RelationshipBar
                        label="intimacy"
                        value={relationship.intimacy}
                        delta={cumulativeDeltaRelationship?.intimacy}
                    />
                    <RelationshipBar
                        label="trust"
                        value={relationship.trust}
                        delta={cumulativeDeltaRelationship?.trust}
                    />
                    <RelationshipBar
                        label="passion"
                        value={relationship.passion}
                        delta={cumulativeDeltaRelationship?.passion}
                    />
                </div>

                {latestDeltaDescription && (
                    <div className="pt-4 border-t border-border">
                        <h4 className="type-ui-label text-muted-foreground mb-2">Latest Change</h4>
                        <p className="type-body-sm text-foreground">{latestDeltaDescription}</p>
                    </div>
                )}

                <div className="pt-4 border-t border-border">
                    <h4 className="type-ui-label text-muted-foreground mb-2">Base Description</h4>
                    <p className="type-body-sm text-foreground">{relationship.description}</p>
                </div>

                {relationship.chat_summaries?.length > 0 && (
                    <div className="pt-4 border-t border-border">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-border">
                                <AccordionTrigger className="type-ui-label text-muted-foreground hover:text-foreground">Chat Summaries</AccordionTrigger>
                                <AccordionContent>
                                    {relationship.chat_summaries.map((summary, index) => (
                                        <div key={index} className="border-t border-border pt-2 mt-2">
                                            <p className="type-ui-label text-muted-foreground">{new Date(summary.timestamp).toLocaleString()}</p>
                                            <p className="type-body-sm text-foreground">{summary.summary}</p>
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
