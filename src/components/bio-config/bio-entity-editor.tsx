import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TagListEditor } from './tag-list-editor';
import { WeightEditor } from './weight-editor';
import { EventNode, LifeEvent, SlotType, AgePhase, AGE_PHASES } from '@/lib/generator/types';
import { GenerateEventsDialog } from './generate-events-dialog';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useBioStore } from "@/lib/store/bioStore";
import { useEntityStore } from "@/lib/entityStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateEntityModal } from './create-entity-modal';

interface BioEntityEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: EventNode | LifeEvent;
    onSave: (data: any) => void;
    type: 'CHILDHOOD' | 'FORMATIVE' | 'PROFESSIONAL' | 'SENIOR' | 'LIFE_EVENT';
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

    // Mapping State
    const [nodeMappings, setNodeMappings] = useState<{ category: string, key: string, isNew?: boolean }[]>([]);
    const [initialMappings, setInitialMappings] = useState<{ category: string, key: string }[]>([]);

    const [isCreateEntityModalOpen, setIsCreateEntityModalOpen] = useState(false);

    const { symbolicMappings, getAllMappableEntities, addSymbolicMapping, deleteSymbolicMapping } = useBioStore();
    const { gameAttributeCategories } = useEntityStore();
    const mappableEntities = getAllMappableEntities();

    // Compute available categories dynamically
    const activeCategoryIds = Array.from(new Set(mappableEntities.map(e => e.categoryId)));
    const categoryOptions = activeCategoryIds.map(catId => {
        if (catId === 'profession') return { id: 'profession', name: 'Profession' };
        const found = gameAttributeCategories?.find(c => c.id === catId);
        return { id: catId, name: found ? found.name : catId };
    });

    const handleEntityCreated = (categoryId: string, entityId: string) => {
        setNodeMappings(prev => {
            // Check if we have an empty "shell" mapping to replace, otherwise append
            const lastMapping = prev[prev.length - 1];
            if (lastMapping && lastMapping.category === 'NONE') {
                const newMappings = [...prev];
                newMappings[newMappings.length - 1] = { category: categoryId, key: entityId };
                return newMappings;
            }
            return [...prev, { category: categoryId, key: entityId }];
        });
    };

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

            // Restore Mapping If Present
            const existingMappings = symbolicMappings?.filter(m => m.nodeId === initialData.id) || [];
            if (existingMappings.length > 0) {
                const mapped = existingMappings.map(m => ({ category: m.category, key: m.key }));
                setNodeMappings([...mapped]);
                setInitialMappings([...mapped]);
            } else {
                setNodeMappings([]);
                setInitialMappings([]);
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
            setNodeMappings([]);
            setInitialMappings([]);
        }
    }, [open, initialData, phase, symbolicMappings]);

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

        // Preserve existing fields (like groupId) that aren't edited here
        const existingData = initialData || {};

        const base = {
            ...existingData,
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
                slot: type as unknown as SlotType,
                requires: requires.length > 0 ? requires : undefined,
                phase: selectedPhase
            } as EventNode);

            // Handle Mapping Logic (Diffing)
            // 1. Find mappings to delete (present in initial, missing from new)
            initialMappings.forEach(im => {
                const stillExists = nodeMappings.some(nm => nm.category === im.category && nm.key === im.key);
                if (!stillExists) {
                    deleteSymbolicMapping(im.category, im.key, id);
                }
            });

            // 2. Find mappings to add (present in new, missing from initial)
            nodeMappings.forEach(nm => {
                // Ignore empty unconfigured rows
                if (nm.category === 'NONE' || !nm.key) return;

                const isNew = !initialMappings.some(im => im.category === nm.category && im.key === nm.key);
                if (isNew) {
                    addSymbolicMapping({
                        category: nm.category,
                        key: nm.key,
                        nodeId: id
                    });
                }
            });
        }
        onOpenChange(false);
    };

    const isEditing = mode === 'edit' && !!initialData;
    const allPhases = Object.keys(AGE_PHASES) as AgePhase[];

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent container={container} className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Entity' : 'New Entity'} ({type})</DialogTitle>
                        <DialogDescription>
                            {isEditing ? `Edit the details of this ${type.toLowerCase()} entity.` : `Create a new ${type.toLowerCase()} entity.`}
                        </DialogDescription>
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
                                    <div className="flex flex-wrap gap-2">
                                        {allPhases.map(p => (
                                            <Button
                                                key={p}
                                                type="button"
                                                variant={selectedPhases.includes(p) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPhases(prev =>
                                                        prev.includes(p)
                                                            ? prev.filter(ph => ph !== p)
                                                            : [...prev, p]
                                                    );
                                                }}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <Input
                                        value={selectedPhase || 'None'}
                                        disabled={true}
                                        className="bg-muted text-muted-foreground"
                                    />
                                )}
                            </div>
                        </div>

                        {type !== 'LIFE_EVENT' && (
                            <div className="p-3 border rounded-md bg-muted/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Symbolic Mappings</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-[10px]"
                                        onClick={() => setNodeMappings([...nodeMappings, { category: 'NONE', key: '', isNew: true }])}
                                        type="button"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Mapping
                                    </Button>
                                </div>

                                {nodeMappings.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No mappings defined for this node.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {nodeMappings.map((mapping, index) => {
                                            const entitiesForCategory = mappableEntities.filter(e => e.categoryId === mapping.category);

                                            // Ensure the current key is rendered even if it's inactive (in edge cases)
                                            // The simplest is to just list all entities for the category.
                                            return (
                                                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end bg-background p-2 rounded border border-border/50">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px]">Category</Label>
                                                        <Select
                                                            value={mapping.category}
                                                            onValueChange={(val) => {
                                                                const newM = [...nodeMappings];
                                                                newM[index] = { ...newM[index], category: val, key: '' };
                                                                setNodeMappings(newM);
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Select Category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="NONE" className="italic text-muted-foreground">Unmapped</SelectItem>
                                                                {categoryOptions.map(cat => (
                                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center h-3">
                                                            <Label className="text-[10px]">Key</Label>
                                                            {index === nodeMappings.length - 1 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-4 px-1 text-[9px]"
                                                                    onClick={() => setIsCreateEntityModalOpen(true)}
                                                                    type="button"
                                                                >
                                                                    <Plus className="w-2 h-2 mr-1" />
                                                                    New Option
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Select
                                                            value={mapping.key}
                                                            onValueChange={(val) => {
                                                                const newM = [...nodeMappings];
                                                                newM[index] = { ...newM[index], key: val };
                                                                setNodeMappings(newM);
                                                            }}
                                                            disabled={mapping.category === 'NONE'}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder={mapping.category === 'NONE' ? "No category" : "Select Key"} />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-[200px]">
                                                                {entitiesForCategory.map(entity => (
                                                                    <SelectItem key={entity.id} value={entity.id}>
                                                                        {entity.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const newM = [...nodeMappings];
                                                            newM.splice(index, 1);
                                                            setNodeMappings(newM);
                                                        }}
                                                        type="button"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

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

            <CreateEntityModal
                open={isCreateEntityModalOpen}
                onOpenChange={setIsCreateEntityModalOpen}
                defaultCategory={nodeMappings.length > 0 ? nodeMappings[nodeMappings.length - 1].category : 'NONE'}
                onCreated={handleEntityCreated}
            />
        </>
    );
}