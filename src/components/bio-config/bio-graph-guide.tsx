import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BioGraphGuide() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="mt-4 border-l-4 border-l-primary/50">
            <CardHeader className="p-4 py-3 flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Graph Legend & System Guide</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </CardHeader>

            {isOpen && (
                <CardContent className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Node Types */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Node Types</h4>
                            <div className="flex flex-col gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-500"></div>
                                    <span className="font-semibold text-emerald-700">Origin (Green)</span>
                                    <span className="text-muted-foreground">- Starting background</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500"></div>
                                    <span className="font-semibold text-blue-700">Education (Blue)</span>
                                    <span className="text-muted-foreground">- Academic path</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-500"></div>
                                    <span className="font-semibold text-purple-700">Career (Purple)</span>
                                    <span className="text-muted-foreground">- Professional role</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-500"></div>
                                    <span className="font-semibold text-amber-700">Senior (Amber)</span>
                                    <span className="text-muted-foreground">- Late-life status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-500"></div>
                                    <span className="font-semibold text-orange-700">Life Event (Orange)</span>
                                    <span className="text-muted-foreground">- Random event</span>
                                </div>
                            </div>
                        </div>

                        {/* Edge Types */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Connections</h4>
                            <div className="flex flex-col gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-0.5 bg-slate-400"></div>
                                    <span className="font-bold">Requirement</span>
                                    <span className="text-muted-foreground">- Strict Dependency. Must have tags to verify.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-0.5 border-b-2 border-orange-500 border-dashed"></div>
                                    <span className="font-bold text-orange-600">Influence</span>
                                    <span className="text-muted-foreground">- Probabilistic. Increases weight/chance.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tag Logic */}
                    <div className="pt-2 border-t space-y-2">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Logic Concepts</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <strong className="block mb-1">Tags (Generic Strings)</strong>
                                <div className="text-muted-foreground flex flex-wrap gap-1 items-center">
                                    <span>Entities grant</span> <Badge variant="secondary" className="px-1 py-0 h-4 text-[10px]">PROVIDES</Badge>
                                    <span>tags (e.g., RICH, SMART).</span>
                                </div>
                            </div>
                            <div>
                                <strong className="block mb-1">Weights (Probability)</strong>
                                <div className="text-muted-foreground space-y-2">
                                    <p>
                                        Tags modify weights. <code className="bg-muted px-1 rounded">RICH (x50)</code> means having the RICH tag creates a 50x multiplier for that event's chance.
                                    </p>
                                    <div className="bg-muted/30 p-2 rounded text-[10px] border border-muted-foreground/20">
                                        <div className="font-semibold mb-1">Example: Relative Probability</div>
                                        <ul className="list-disc pl-3 space-y-0.5">
                                            <li><span className="font-mono">Event A</span> (Default 1)</li>
                                            <li><span className="font-mono">Event B</span> (Weight 50 via Tag)</li>
                                        </ul>
                                        <div className="mt-1 pt-1 border-t border-muted-foreground/20">
                                            Total Weight: <span className="font-mono">51</span>
                                            <div className="grid grid-cols-2 mt-0.5 gap-2">
                                                <div>Chance A: 1/51 (~2%)</div>
                                                <div>Chance B: 50/51 (~98%)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
