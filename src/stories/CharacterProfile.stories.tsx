import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
    title: 'Templates/Character Profile',
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Data
const character = {
    name: "Kaelthas Sunstrider",
    race: "Elf",
    class: "Mage",
    level: 12,
    avatar: "https://github.com/shadcn.png", // Using a placeholder that works
    stats: [
        { label: "STR", value: 8, mod: -1 },
        { label: "DEX", value: 14, mod: +2 },
        { label: "CON", value: 12, mod: +1 },
        { label: "INT", value: 20, mod: +5 },
        { label: "WIS", value: 16, mod: +3 },
        { label: "CHA", value: 18, mod: +4 },
    ],
    skills: ["Arcana", "History", "Persuasion"],
    inventory: [
        { name: "Staff of the Magi", type: "Weapon", rarity: "Legendary" },
        { name: "Robes of the Archmage", type: "Armor", rarity: "Legendary" },
        { name: "Potion of Healing", type: "Consumable", rarity: "Common" },
    ],
    backstory: `Kael'thas Sunstrider was the Prince of Quel'Thalas, the last of the Sunstrider dynasty. After the fall of Silvermoon, he led the remnants of his people, the Blood Elves, in search of a new source of magic to satisfy their addiction.`,
};

export const ProfilePage: Story = {
    render: () => (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Sidebar: Character Summary & Stats */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-2">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 relative w-32 h-32">
                                <Avatar className="w-32 h-32 border-4 border-muted">
                                    <AvatarImage src={character.avatar} alt={character.name} />
                                    <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Badge className="absolute bottom-0 right-0 px-3 py-1 text-base">Lvl {character.level}</Badge>
                            </div>
                            <CardTitle className="text-2xl font-serif">{character.name}</CardTitle>
                            <CardDescription className="text-lg">{character.race} {character.class}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted p-3 rounded-md text-center">
                                    <div className="text-xs uppercase text-muted-foreground font-bold">HP</div>
                                    <div className="text-xl font-bold text-green-600">84/84</div>
                                </div>
                                <div className="bg-muted text-center p-3 rounded-md">
                                    <div className="text-xs uppercase text-muted-foreground font-bold">AC</div>
                                    <div className="text-xl font-bold">15</div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" className="w-full mr-2">Edit</Button>
                            <Button className="w-full ml-2">Sheet</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ability Scores</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {character.stats.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="w-10 h-10 flex items-center justify-center font-bold bg-muted">{stat.label}</Badge>
                                        <span className="font-medium text-lg">{stat.value}</span>
                                    </div>
                                    <span className="text-sm font-bold bg-primary text-primary-foreground px-2 py-1 rounded">
                                        {stat.mod > 0 ? `+${stat.mod}` : stat.mod}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-8 space-y-6">
                    {/* Top Stats/Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Proficiency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+4</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Speed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">30 ft.</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Initiative</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs for Bio, Inventory, Spells */}
                    <Tabs defaultValue="bio" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="bio">Biography</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="spells">Spells</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bio">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About {character.name}</CardTitle>
                                    <CardDescription>History and Personality</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="leading-relaxed">{character.backstory}</p>

                                    <div className="mt-4">
                                        <Label className="text-base font-semibold">Traits & Ideals</Label>
                                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                                            <li>Determined to save his people.</li>
                                            <li>Arrogant but charismatic.</li>
                                            <li>Willing to do whatever it takes.</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="inventory">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Equipment</CardTitle>
                                    <CardDescription>Carried items and wealth</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-4">
                                            {character.inventory.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground">{item.type}</span>
                                                    </div>
                                                    <Badge variant={item.rarity === 'Legendary' ? 'destructive' : 'secondary'}>{item.rarity}</Badge>
                                                </div>
                                            ))}
                                            {/* Fillers for scroll */}
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={`fill-${i}`} className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                                                    <span className="text-muted-foreground">Empty Slot</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="justify-between border-t pt-4">
                                    <div className="flex gap-4 text-sm font-medium">
                                        <span><span className="text-yellow-600">GP</span> 1,240</span>
                                        <span><span className="text-gray-400">SP</span> 45</span>
                                        <span><span className="text-orange-700">CP</span> 12</span>
                                    </div>
                                    <Button size="sm">Add Item</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="spells">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Spellbook</CardTitle>
                                    <CardDescription>Prepared Spells (DC 17)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Fireball', 'Counterspell', 'Misty Step', 'Shield', 'Magic Missile', 'Detect Magic'].map((spell) => (
                                            <div key={spell} className="p-3 border rounded-md flex justify-between items-center">
                                                <span>{spell}</span>
                                                <Badge variant="outline">Lvl 3</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

            </div>
        </div>
    ),
};
