import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TagListEditor } from './tag-list-editor';
import { WeightEditor } from './weight-editor';
import { EventNode, LifeEvent, SlotType, AgePhase, AGE_PHASES } from '@/lib/generator/types';
import { GenerateEventsDialog } from './generate-events-dialog';
import { Sparkles, Check, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface BioEntityEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: EventNode | LifeEvent;
    onSave: (data: any) => void;
    type: 'ORIGIN' | 'EDUCATION' | 'CAREER' | 'LIFE_EVENT';
    phase?: AgePhase; // Suggested phase from tab
    existingIds: string[];
    mode?: 'create' | 'edit';
    container?: HTMLElement | null;
}

export function BioEntityEditor({ open, onOpenChange, initialData, onSave, type, phase, existingIds, mode = 'edit', container }: BioEntityEditorProps) {
    const [id, setId] = useState('');
    const [text, setText] = useState('');
    const [provides, setProvides] = useState<string[]>([]);
    const [requires, setRequires] = useState<string[]>([]);
    const [weights, setWeights] = useState<{ [tag: string]: number; "DEFAULT": number }>({ "DEFAULT": 1 });
    const [selectedPhase, setSelectedPhase] = useState<AgePhase | undefined>(undefined);
    const [selectedPhases, setSelectedPhases] = useState<AgePhase[]>([]);
    const [showGenerator, setShowGenerator] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            setId(initialData.id);
            setText(initialData.text);
            setProvides(initialData.provides || []);
            setWeights(initialData.weights);

            if ('requires' in initialData) {
                setRequires(initialData.requires || []);
            } else {
                setRequires([]);
            }

            if ('phase' in initialData) {
                setSelectedPhase(initialData.phase);
            } else {
                setSelectedPhase(undefined);
            }

            if ('phases' in initialData) {
                setSelectedPhases(initialData.phases || []);
            } else {
                setSelectedPhases([]);
            }
        } else if (open) {
            // Reset for new
            setId('');
            setText('');
            setProvides([]);
            setRequires([]);
            setWeights({ "DEFAULT": 1 });
            setSelectedPhase(phase);
            setSelectedPhases(phase ? [phase] : []);
        }
    }, [open, initialData, phase]);

    const isDuplicateId = useMemo(() => {
        if (!id) return false;
        // If we are editing and the ID matches the initial ID, it's not a duplicate (it's the same item)
        // But if we are in 'create' mode, even if it matches initialData (which might be a template), it IS a duplicate if it exists in the list.
        // Wait, validation logic:
        // Collision if: ID exists in list AND ( (Mode is Create) OR (Mode is Edit AND ID != originalID) )
        if (mode === 'edit' && initialData && id === initialData.id) {
            return false;
        }
        return existingIds.includes(id);
    }, [id, existingIds, mode, initialData]);

    const handleSave = () => {
        if (!id || !text || isDuplicateId) return;

        const base = {
            id,
            text,
            provides: provides.length > 0 ? provides : undefined,
            weights
        };

        if (type === 'LIFE_EVENT') {
            onSave({
                ...base,
                requires: requires.length > 0 ? requires : undefined,
                phases: selectedPhases.length > 0 ? selectedPhases : undefined
            } as LifeEvent);
        } else {
            onSave({
                ...base,
                slot: type as SlotType,
                requires: requires.length > 0 ? requires : undefined,
                phase: selectedPhase
            } as EventNode);
        }
        onOpenChange(false);
    };

    const isEditing = mode === 'edit' && !!initialData;
    const allPhases = Object.keys(AGE_PHASES) as AgePhase[];

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent container={container} className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Entity' : 'New Entity'} ({type})</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ID (Unique)</Label>
                                <Input
                                    value={id}
                                    onChange={e => setId(e.target.value)}
                                    placeholder="my_entity_id"
                                    className={isDuplicateId ? "border-red-500" : ""}
                                />
                                {isDuplicateId && (
                                    <p className="text-xs text-red-500">ID already exists!</p>
                                )}
                            </div>
                            
                            {/* Phase Selection */}
                            <div className="space-y-2">
                                <Label>Age Phase{type === 'LIFE_EVENT' ? 's' : ''}</Label>
                                {type === 'LIFE_EVENT' ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between font-normal"
                                            >
                                                {selectedPhases.length > 0
                                                    ? `${selectedPhases.length} Phases selected`
                                                    : "Select phases..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search phase..." />
                                                <CommandEmpty>No phase found.</CommandEmpty>
                                                <CommandGroup>
                                                    {allPhases.map((phase) => (
                                                        <CommandItem
                                                            key={phase}
                                                            onSelect={() => {
                                                                setSelectedPhases(prev => 
                                                                    prev.includes(phase)
                                                                        ? prev.filter(p => p !== phase)
                                                                        : [...prev, phase]
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedPhases.includes(phase) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {phase}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <Select value={selectedPhase} onValueChange={(v: AgePhase) => setSelectedPhase(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select phase" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allPhases.map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Narrative Text</Label>
                            <Textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Description of the event..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <TagListEditor
                                    label="Provides Tags (Grants)"
                                    tags={provides}
                                    onChange={setProvides}
                                    placeholder="WEALTHY"
                                />

                                <TagListEditor
                                    label="Requires Tags (Prerequisite)"
                                    tags={requires}
                                    onChange={setRequires}
                                    placeholder="DEGREE"
                                />
                            </div>

                            <div>
                                <WeightEditor weights={weights} onChange={setWeights} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between items-center">
                         <div className="flex gap-2">
                            {isEditing && (
                               <Button variant="secondary" onClick={() => setShowGenerator(true)} type="button">
                                   <Sparkles className="w-4 h-4 mr-2" />
                                   Gen Events
                               </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!id || !text || isDuplicateId}>Save</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isEditing && initialData && (
                <GenerateEventsDialog 
                    open={showGenerator} 
                    onOpenChange={setShowGenerator} 
                    sourceEntity={initialData} 
                />
            )}
        </>
    );
}
