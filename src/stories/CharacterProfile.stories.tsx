import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

const meta = {
    title: 'Templates/Character Profile',
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Components ---

// Updated to use a custom blue color for stats to match reference
const StatBox = ({ filled }: { filled: boolean }) => (
    <div className={cn(
        "h-4 w-6 rounded-sm border transition-colors",
        filled
            ? "bg-[#336699] border-[#336699]"
            : "bg-transparent border-muted-foreground/30"
    )} />
);

const StatRow = ({ label, value, max = 5 }: { label: string; value: number; max?: number }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-sm font-semibold uppercase tracking-tight text-foreground/80">{label}</span>
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <StatBox key={i} filled={i < value} />
            ))}
        </div>
    </div>
);

// Moved headers outside of Card and updated styling
const SectionHeader = ({ title }: { title: string }) => (
    <div className="relative flex items-center justify-center mb-2 mt-4">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative bg-background px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {title}
        </div>
    </div>
);

const SkillList = ({ skills }: { skills: Record<string, number | null> }) => (
    <div className="space-y-1">
        {Object.entries(skills).map(([skill, value]) => (
            <div key={skill} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0 hover:bg-muted/50 px-2 rounded-sm cursor-default">
                <span className="font-medium text-foreground/90">{skill}</span>
                <span className="text-muted-foreground">{value === null ? "–" : "•".repeat(value)}</span>
            </div>
        ))}
    </div>
);

// --- Data ---

const character = {
    name: "ALEX CHEN",
    bane: "Unknown",
    compulsion: "Unknown",
    xp: 0,
    attributes: {
        physical: [
            { label: "Strength", value: 3 },
            { label: "Dexterity", value: 2 },
            { label: "Stamina", value: 2 },
        ],
        social: [
            { label: "Charisma", value: 4 },
            { label: "Manipulation", value: 3 },
            { label: "Composure", value: 3 },
        ],
        mental: [
            { label: "Intelligence", value: 3 },
            { label: "Wits", value: 2 },
            { label: "Resolve", value: 2 },
        ]
    },
    skills: {
        physical: {
            "Athletics": null,
            "Craft": null,
            "Firearms": null,
            "Melee": null,
            "Survival": null,
            "Brawl": null,
            "Drive": null,
            "Larceny": null,
            "Stealth": null,
        },
        social: {
            "Animal Ken": null,
            "Insight": null,
            "Leadership": null,
            "Persuasion": null,
            "Subterfuge": null,
            "Etiquette": null,
            "Intimidation": null,
            "Performance": null,
            "Streetwise": null,
        },
        mental: {
            "Finance": null,
            "Technology": null,
            "Medicine": null,
            "Politics": null,
            "Awareness": null,
            "Investigation": null,
            "Occult": null,
            "Science": null,
        }
    },
    ocean: [
        { label: "Openness", value: 4 },
        { label: "Conscientiousness", value: 3 },
        { label: "Extraversion", value: 3 },
        { label: "Agreeableness", value: 3 },
        { label: "Neuroticism", value: 4 },
    ],
    bio: `Former political strategist, now a freelance data broker. Born into a noble family, educated in economics, career derailed by a scandal.

Traits: Analytical, Charming, Opportunist.

Life Events: 'Political Scandal', 'Career Pivot'.`
};

export const ProfilePage: Story = {
                        { character.ocean.map(stat => <StatRow key={stat.label} {...stat} />) }
                    </div >
                </div >

    {/* Bottom Tabs */ }
    < div className = "pt-8" >
        <Tabs defaultValue="bio" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                {['Relationships (PRQC)', 'Traits & Tags', 'Social Network', 'Biography (BioMachine)', 'Inventory', 'Notes'].map(tab => {
                    const val = tab.split(' ')[0].toLowerCase();
                    return (
                        <TabsTrigger
                            key={val}
                            value={val}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 uppercase tracking-wide text-xs font-bold text-muted-foreground data-[state=active]:text-foreground"
                        >
                            {tab}
                        </TabsTrigger>
                    )
                })}
            </TabsList>

            <TabsContent value="biography" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 rounded-sm border shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-lg leading-relaxed text-foreground">
                                {character.bio.split('\n\n')[0]}
                            </p>
                            <div className="mt-6 space-y-4">
                                <div>
                                    <span className="font-bold">Traits:</span> Analytical, Charming, Opportunist.
                                </div>
                                <div>
                                    <span className="font-bold">Life Events:</span> 'Political Scandal', 'Career Pivot'.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-sm border bg-muted/20 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <h4 className="font-bold uppercase tracking-wide text-sm mb-4">Relationship Snapshot</h4>
                            {[
                                { label: "Satisfaction", value: 80 },
                                { label: "Commitment", value: 65 },
                                { label: "Intimacy", value: 40 },
                                { label: "Trust", value: 50 },
                                { label: "Passion", value: 70 },
                            ].map(stat => (
                                <div key={stat.label} className="space-y-1">
                                    <span className="text-xs font-semibold uppercase">{stat.label}</span>
                                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden border">
                                        <div className="h-full bg-blue-600" style={{ width: `${stat.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
                </div >

            </div >
        </div >
    ),
};
