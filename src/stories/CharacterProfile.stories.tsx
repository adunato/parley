import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionHeader } from '@/components/ui/section-header';
import { ScoredStatCard } from '@/components/ui/scored-stat-card';
import { ScoredStatGroup } from '@/components/ui/scored-stat-group';
import { StatBox } from '@/components/ui/stat-box';
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

// This remains local for now as it's specific to the skill list layout
// but reuses the base StatBox
const SkillList = ({ skills }: { skills: Record<string, number | null> }) => (
    <div className="space-y-1">
        {Object.entries(skills).map(([skill, value]) => (
            <div key={skill} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0 hover:bg-muted/50 px-2 rounded-sm cursor-default">
                <span className="font-medium font-display tracking-tight text-foreground/90 uppercase">{skill}</span>
                <span className="text-muted-foreground">{value === null ? "–" :
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <StatBox key={i} filled={i < value} />
                        ))}
                    </div>
                }</span>
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
            "Athletics": 1,
            "Craft": null,
            "Firearms": 2,
            "Melee": 3,
            "Survival": null,
            "Brawl": 2,
            "Drive": 1,
            "Larceny": null,
            "Stealth": null,
        },
        social: {
            "Animal Ken": null,
            "Insight": 3,
            "Leadership": 2,
            "Persuasion": 4,
            "Subterfuge": 1,
            "Etiquette": 2,
            "Intimidation": null,
            "Performance": null,
            "Streetwise": 1,
        },
        mental: {
            "Finance": 2,
            "Technology": 3,
            "Medicine": null,
            "Politics": 1,
            "Awareness": 2,
            "Investigation": 3,
            "Occult": 4,
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
    render: () => (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-background text-foreground p-6 md:p-12 font-sans select-none">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-gray-300 dark:border-border">
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-display font-medium tracking-tight text-gray-800 dark:text-foreground uppercase">{character.name}</h1>
                            <Menu className="w-8 h-8 text-gray-400 cursor-pointer hover:text-foreground" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm">
                        <div className="text-right space-y-1">
                            <div className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Bane: <span className="text-foreground font-normal normal-case">{character.bane}</span></div>
                            <div className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Compulsion: <span className="text-foreground font-normal normal-case">{character.compulsion}</span></div>
                        </div>
                        <Button className="bg-[#336699] hover:bg-[#254e75] text-white font-bold px-8 py-6 rounded-sm shadow-sm uppercase tracking-wider text-sm font-display">
                            Perform<br />Action
                        </Button>
                        <div className="text-center font-display">
                            <div className="text-4xl font-light text-gray-800 dark:text-foreground">0</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Experience</div>
                        </div>
                    </div>
                </div>

                {/* Attributes Section */}
                <div className="space-y-2">
                    <SectionHeader title="Attributes" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScoredStatGroup title="Physical">
                            {character.attributes.physical.map(attr => (
                                <ScoredStatCard key={attr.label} {...attr} />
                            ))}
                        </ScoredStatGroup>
                        <ScoredStatGroup title="Social">
                            {character.attributes.social.map(attr => (
                                <ScoredStatCard key={attr.label} {...attr} />
                            ))}
                        </ScoredStatGroup>
                        <ScoredStatGroup title="Mental">
                            {character.attributes.mental.map(attr => (
                                <ScoredStatCard key={attr.label} {...attr} />
                            ))}
                        </ScoredStatGroup>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                    <SectionHeader title="Skills" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div>
                            <div className="mb-2 px-1 text-lg font-display font-medium uppercase tracking-wider text-muted-foreground">Physical</div>
                            <Card className="rounded-sm shadow-sm border-0 bg-white dark:bg-card">
                                <CardContent className="pt-4 grid grid-cols-2 gap-x-6">
                                    <SkillList skills={character.skills.physical} />
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <div className="mb-2 px-1 text-lg font-display font-medium uppercase tracking-wider text-muted-foreground">Social</div>
                            <Card className="rounded-sm shadow-sm border-0 bg-white dark:bg-card">
                                <CardContent className="pt-4 grid grid-cols-2 gap-x-6">
                                    <SkillList skills={character.skills.social} />
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <div className="mb-2 px-1 text-lg font-display font-medium uppercase tracking-wider text-muted-foreground">Mental</div>
                            <Card className="rounded-sm shadow-sm border-0 bg-white dark:bg-card">
                                <CardContent className="pt-4 grid grid-cols-2 gap-x-6">
                                    <SkillList skills={character.skills.mental} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground/80 transition-colors">
                            Expand ▼
                        </span>
                    </div>
                </div>

                {/* Personality Profile */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground font-display">Personality Profile (OCEAN)</h3>
                    <div className="w-full md:w-1/3 space-y-3">
                        {/* Reusing ScoredStatCard for personality profile too since it matches the look */}
                        {character.ocean.map(stat => <ScoredStatCard key={stat.label} {...stat} className="border-l-0 border-t-0 bg-transparent shadow-none px-0" />)}
                    </div>
                </div>

                {/* Bottom Tabs */}
                <div className="pt-8">
                    <Tabs defaultValue="bio" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto gap-1">
                            {['Relationships (PRQC)', 'Traits & Tags', 'Social Network', 'Biography (BioMachine)', 'Inventory', 'Notes'].map(tab => {
                                const val = tab.split(' ')[0].toLowerCase();
                                return (
                                    <TabsTrigger
                                        key={val}
                                        value={val}
                                        className="bg-white dark:bg-card/20 border-t border-x border-transparent rounded-t-sm data-[state=active]:border-gray-300 dark:data-[state=active]:border-muted data-[state=active]:bg-white dark:data-[state=active]:bg-card px-6 py-3 uppercase tracking-wide text-xs font-bold text-muted-foreground data-[state=active]:text-foreground shadow-none"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>

                        <TabsContent value="biography" className="mt-0 border rounded-b-sm border-t-0 bg-white dark:bg-card shadow-sm p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <div className="p-4 border rounded-sm h-full">
                                        <p className="text-lg leading-relaxed text-foreground font-serif">
                                            {character.bio.split('\n\n')[0]}
                                        </p>
                                        <div className="mt-6 space-y-4 text-sm font-sans">
                                            <div>
                                                <span className="font-bold">Traits:</span> Analytical, Charming, Opportunist.
                                            </div>
                                            <div>
                                                <span className="font-bold">Life Events:</span> 'Political Scandal', 'Career Pivot'.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/10">
                                    <div className="p-4 border rounded-sm bg-gray-50 dark:bg-muted/10 h-full">
                                        <h4 className="font-bold uppercase tracking-wide text-xs mb-4 text-muted-foreground">Relationship Snapshot</h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Satisfaction", value: 80 },
                                                { label: "Commitment", value: 65 },
                                                { label: "Intimacy", value: 40 },
                                                { label: "Trust", value: 50 },
                                                { label: "Passion", value: 70 },
                                            ].map(stat => (
                                                <div key={stat.label} className="space-y-1">
                                                    <div className="flex justify-between text-xs uppercase font-semibold text-muted-foreground">
                                                        <span>{stat.label}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-200 dark:bg-muted rounded-none overflow-hidden border border-gray-300 dark:border-muted-foreground/20">
                                                        <div className="h-full bg-[#336699]" style={{ width: `${stat.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

            </div>
        </div>
    ),
};
