import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Combobox } from '@/components/ui/combobox';

// Domain Components
import { SectionHeader } from '@/components/ui/section-header';
import { ScoredStatCard } from '@/components/ui/scored-stat-card';
import { ScoredStatGroup } from '@/components/ui/scored-stat-group';
import { SkillList } from '@/components/ui/skill-list';
import { SkillGroup } from '@/components/ui/skill-group';
import { GameTimeDisplay } from '@/components/ui/game-time-display';
import { StatBox } from '@/components/ui/stat-box';

const meta = {
    title: 'Design System Showcase',
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ColorSwatch = ({ name, variable, className }: { name: string, variable: string, className?: string }) => (
    <div className="flex flex-col gap-2">
        <div className={`h-24 w-full rounded-md shadow-sm border ${className}`} style={{ backgroundColor: `hsl(var(${variable}))` }} />
        <div className="space-y-1">
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground font-mono">{variable}</p>
        </div>
    </div>
);

export const Showcase: Story = {
    render: () => (
        <div className="min-h-screen bg-background text-foreground p-8 md:p-12 space-y-16 max-w-[1400px] mx-auto font-sans">

            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-5xl font-display uppercase tracking-tight text-primary">Design System Showcase</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    The visual language of Parley. This document serves as the source of truth for all UI elements, tokens, and components.
                </p>
                <div className="flex gap-4 pt-2">
                    <Badge className="text-xs uppercase tracking-wider">v2.0 Harmonisation</Badge>
                </div>
            </div>

            <hr className="border-border" />

            {/* Design Tokens: Colors */}
            <section className="space-y-8">
                <SectionHeader title="01. Color Palette" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <ColorSwatch name="Primary" variable="--primary" className="bg-primary" />
                    <ColorSwatch name="Secondary" variable="--secondary" className="bg-secondary" />
                    <ColorSwatch name="Background" variable="--background" className="bg-background" />
                    <ColorSwatch name="Foreground" variable="--foreground" className="bg-foreground" />
                    <ColorSwatch name="Muted" variable="--muted" className="bg-muted" />
                    <ColorSwatch name="Muted Foreground" variable="--muted-foreground" className="bg-muted-foreground" />
                    <ColorSwatch name="Destructive" variable="--destructive" className="bg-destructive" />
                    <ColorSwatch name="Border" variable="--border" className="bg-border" />
                </div>
            </section>

            {/* Design Tokens: Typography */}
            <section className="space-y-8">
                <SectionHeader title="02. Typography" />

                <div className="grid gap-12">
                    {/* Font Families */}
                    <div className="space-y-4">
                        <h3 className="type-ui-subhead text-muted-foreground border-b pb-2">Font Families</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Oswald */}
                            <div className="space-y-2">
                                <div className="p-6 border rounded-md bg-card flex items-center justify-center min-h-[120px]">
                                    <p className="font-display text-6xl">Aa</p>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">Oswald</p>
                                        <code className="text-xs text-muted-foreground">font-display</code>
                                    </div>
                                    <p className="type-body-sm text-muted-foreground mt-1">Primary headings and emphatic text.</p>
                                </div>
                            </div>
                            {/* Inter */}
                            <div className="space-y-2">
                                <div className="p-6 border rounded-md bg-card flex items-center justify-center min-h-[120px]">
                                    <p className="font-sans text-6xl">Aa</p>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">Inter</p>
                                        <code className="text-xs text-muted-foreground">font-sans</code>
                                    </div>
                                    <p className="type-body-sm text-muted-foreground mt-1">Default body copy and UI elements.</p>
                                </div>
                            </div>
                            {/* Cinzel */}
                            <div className="space-y-2">
                                <div className="p-6 border rounded-md bg-card flex items-center justify-center min-h-[120px]">
                                    <p className="font-serif text-6xl">Aa</p>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">Cinzel</p>
                                        <code className="text-xs text-muted-foreground">font-serif</code>
                                    </div>
                                    <p className="type-body-sm text-muted-foreground mt-1">Decorative accents and special occasions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Headings */}
                    <div className="space-y-4">
                        <h3 className="type-ui-subhead text-muted-foreground border-b pb-2">Headings & Section Headers</h3>
                        <div className="space-y-8">
                            <div className="grid gap-2">
                                <h1 className="type-h1">Heading 1</h1>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>.type-h1</span>
                                    <span>(60px/3.75rem)</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <h2 className="type-h2">Heading 2</h2>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>.type-h2</span>
                                    <span>(48px/3rem)</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <h3 className="type-h3">Heading 3</h3>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>.type-h3</span>
                                    <span>(36px/2.25rem)</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <h4 className="type-h4">Heading 4</h4>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>.type-h4</span>
                                    <span>(24px/1.5rem)</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <div className="type-section-header text-muted-foreground">Section Header</div>
                                <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                                    <span>.type-section-header</span>
                                    <span>(20px/1.25rem)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Body Text */}
                        <div className="space-y-4">
                            <h3 className="type-ui-subhead text-muted-foreground border-b pb-2">Body Text</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="type-body-lg">
                                        <span className="font-semibold block mb-1">Body Large</span>
                                        The quick brown fox jumps over the lazy dog. Used for intro paragraphs.
                                    </p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-body-lg</code>
                                </div>
                                <div>
                                    <p className="type-body-base">
                                        <span className="font-semibold block mb-1">Body Base</span>
                                        The quick brown fox jumps over the lazy dog. Standard size for reading.
                                    </p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-body-base</code>
                                </div>
                                <div>
                                    <p className="type-body-sm">
                                        <span className="font-semibold block mb-1">Body Small</span>
                                        The quick brown fox jumps over the lazy dog. Used for dense interfaces.
                                    </p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-body-sm</code>
                                </div>
                                <div>
                                    <p className="type-body-xs">
                                        <span className="font-semibold block mb-1">Body XS</span>
                                        The quick brown fox jumps over the lazy dog. Metadata and captains.
                                    </p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-body-xs</code>
                                </div>
                            </div>
                        </div>

                        {/* UI Patterns */}
                        <div className="space-y-4">
                            <h3 className="type-ui-subhead text-muted-foreground border-b pb-2">UI Patterns</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="type-ui-subhead text-muted-foreground mt-1 mb-2">UI Subheading</p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-ui-subhead</code>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">UI Label</p>
                                    <div className="type-ui-label text-muted-foreground">Category Label</div>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-ui-label</code>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Muted Text</p>
                                    <p className="type-ui-muted">Content that is present but secondary.</p>
                                    <code className="text-xs text-muted-foreground mt-1 block">.type-ui-muted</code>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Monospace</p>
                                    <p className="font-mono text-sm">const value = "code";</p>
                                    <code className="text-xs text-muted-foreground mt-1 block">font-mono</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Primitive Components */}
            <section className="space-y-12">
                <SectionHeader title="03. Interface Primitives" />

                {/* Buttons */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Buttons</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="default">Primary Action</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                        <Button size="sm" variant="default" className="uppercase tracking-wider font-bold text-xs">Small Caps</Button>
                    </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Form Inputs</h3>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input type="email" id="email" placeholder="name@example.com" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Select Option</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>North America</SelectLabel>
                                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                                        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Searchable Combobox</Label>
                            <Combobox
                                items={[{ id: 'React' }, { id: 'Vue' }, { id: 'Angular' }, { id: 'Svelte' }]}
                                value=""
                                onValueChange={() => { }}
                                placeholder="Select framework..."
                            />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Text Area</Label>
                            <Textarea placeholder="Type your message here." />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Selection & Toggles</h3>
                        <RadioGroup defaultValue="comfortable">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="default" id="r1" />
                                <Label htmlFor="r1">Default View</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="comfortable" id="r2" />
                                <Label htmlFor="r2">Comfortable View</Label>
                            </div>
                        </RadioGroup>
                        <div className="pt-4 flex gap-4">
                            <Badge>Default Badge</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Badge variant="outline">Outline</Badge>
                        </div>
                    </div>
                </div>

                {/* Feedback & Overlays */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Overlays</h3>
                    <div className="flex gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Open Dialog</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmation Required</DialogTitle>
                                    <DialogDescription>
                                        This action creates a significant event in the story.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">Content goes here...</div>
                                <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Confirm</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Open Popover</Button>
                            </PopoverTrigger>
                            <PopoverContent>Place content for the popover here.</PopoverContent>
                        </Popover>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">?</Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Helpful tooltip information</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </section>

            {/* Domain Components */}
            <section className="space-y-12">
                <SectionHeader title="04. Game Components" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Character Stats</h3>
                        <div className="bg-card border p-6 rounded-md shadow-sm space-y-6">
                            <ScoredStatGroup title="Physical Attributes">
                                <ScoredStatCard label="Strength" value={4} />
                                <ScoredStatCard label="Dexterity" value={2} />
                                <ScoredStatCard label="Stamina" value={3} />
                            </ScoredStatGroup>

                            <SkillGroup title="Top Skills">
                                <SkillList skills={{ "Athletics": 3, "Brawl": 4, "Stealth": 2 }} />
                            </SkillGroup>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">Game State & Display</h3>
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Time Display</h4>
                                <div className="flex flex-wrap gap-4">
                                    <GameTimeDisplay day={1} timeOfDay="Morning" weather="Sunny" />
                                    <GameTimeDisplay day={4} timeOfDay="Evening" weather="Rainy" />
                                    <GameTimeDisplay day={12} timeOfDay="Night" weather="Clear" />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Avatars</h4>
                                <div className="flex gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-primary">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-12 w-12 text-sm">
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tabs Navigation</h4>
                                <Tabs defaultValue="account" className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="account">Account</TabsTrigger>
                                        <TabsTrigger value="password">Password</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="account">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Account</CardTitle>
                                                <CardDescription>
                                                    Make changes to your account here.
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="password">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Password</CardTitle>
                                                <CardDescription>
                                                    Change your password here.
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    ),
};
