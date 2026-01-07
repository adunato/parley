import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Need to check if this exists, if not I'll just use <hr> or create it.
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const meta = {
    title: 'Design System/Showcase',
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
    render: () => (
        <div className="min-h-screen bg-background text-foreground p-8 md:p-12 space-y-12 max-w-7xl mx-auto">

            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Design System</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    A comprehensive guide to the components, typography, and styles used in the Parley application.
                </p>
                <div className="flex gap-4 pt-4">
                    <Badge>v1.0.0</Badge>
                    <Badge variant="secondary">Dark Mode Ready</Badge>
                    <Badge variant="outline">Accessibility First</Badge>
                </div>
            </div>

            <hr className="border-border" />

            {/* Typography Section */}
            <section className="space-y-8">
                <h2 className="text-3xl font-semibold tracking-tight border-b pb-2">Typography</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Heading 1</span>
                            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                                The Joke Tax Chronicles
                            </h1>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Heading 2</span>
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                The People of the Kingdom
                            </h2>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Heading 3</span>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                The Joke Tax
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Heading 4</span>
                            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                People stopped telling jokes
                            </h4>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Paragraph</span>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                The king, seeing how happy his people were, realized that he had been worrying about the wrong things.
                                He realized that the most important thing wasn't power, or wealth, or status. It was happiness.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Blockquote</span>
                            <blockquote className="mt-6 border-l-2 pl-6 italic">
                                "After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the privilege."
                            </blockquote>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Inline Code</span>
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                @radix-ui/react-alert-dialog
                            </code>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Lead</span>
                            <p className="text-xl text-muted-foreground">
                                A modal dialog that interrupts the user with important content and expects a response.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Buttons & Badges */}
            <section className="space-y-8">
                <h2 className="text-3xl font-semibold tracking-tight border-b pb-2">Primitives</h2>

                {/* Buttons */}
                <div className="space-y-4">
                    <h3 className="text-xl font-medium">Buttons</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button size="lg">Large</Button>
                        <Button size="default">Default</Button>
                        <Button size="sm">Small</Button>
                        <Button size="icon">🔔</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button disabled>Disabled</Button>
                        <Button variant="secondary" disabled>Disabled</Button>
                    </div>
                </div>

                {/* Badges */}
                <div className="space-y-4">
                    <h3 className="text-xl font-medium">Badges</h3>
                    <div className="flex gap-4">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                    </div>
                </div>
            </section>

            {/* Forms */}
            <section className="space-y-8">
                <h2 className="text-3xl font-semibold tracking-tight border-b pb-2">Form Elements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" placeholder="Email" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="file">File Input</Label>
                            <Input type="file" id="file" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="disabled-input">Disabled Input</Label>
                            <Input disabled type="email" id="disabled-input" placeholder="Disabled" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="message">Message</Label>
                            <Textarea placeholder="Type your message here." id="message" />
                        </div>

                        <div className="flex items-center gap-8">
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>North America</SelectLabel>
                                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                                        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                                        <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                                        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                                        <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                                        <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <RadioGroup defaultValue="comfortable">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="default" id="r1" />
                                    <Label htmlFor="r1">Default</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="comfortable" id="r2" />
                                    <Label htmlFor="r2">Comfortable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="compact" id="r3" />
                                    <Label htmlFor="r3">Compact</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            </section>

            {/* Components & Layout */}
            <section className="space-y-8">
                <h2 className="text-3xl font-semibold tracking-tight border-b pb-2">Components</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>You have 3 unread messages.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded-md">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Friend Request</p>
                                    <p className="text-xs text-muted-foreground">2 mins ago</p>
                                </div>
                                <Button size="sm" variant="outline">Accept</Button>
                            </div>
                            <div className="flex items-center justify-between p-2 border rounded-md">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">New Comment</p>
                                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                                </div>
                                <Button size="sm" variant="ghost">View</Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Mark all as read</Button>
                        </CardFooter>
                    </Card>

                    {/* Tabs */}
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>Manage your account settings and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="account" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="account">Account</TabsTrigger>
                                    <TabsTrigger value="password">Password</TabsTrigger>
                                </TabsList>
                                <TabsContent value="account">
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Username</Label>
                                            <Input defaultValue="@johndoe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input defaultValue="john@example.com" />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="password">
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Current Password</Label>
                                            <Input type="password" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input type="password" />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Accordion & Scroll Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>FAQ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It adheres to the WAI-ARIA design pattern.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It comes with default styles that matches the other components' aesthetic.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It's animated by default, but you can disable it if you prefer.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>License Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4 text-sm">
                                <h4 className="mb-4 font-medium leading-none">MIT License</h4>
                                <p className="mb-4">
                                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                                </p>
                                <p className="mb-4">
                                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                                </p>
                                <p>
                                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                                </p>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Overlays */}
            <section className="space-y-8 pb-12">
                <h2 className="text-3xl font-semibold tracking-tight border-b pb-2">Overlays</h2>
                <div className="flex flex-wrap gap-8">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline">Hover for Tooltip</Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This is a tooltip text!</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Open Popover</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Dimensions</h4>
                                    <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive">Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>

        </div>
    ),
};
