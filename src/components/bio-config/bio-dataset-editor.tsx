import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Copy, FolderPlus, Settings, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BioEntityEditor } from './bio-entity-editor';
import { CreateGroupModal } from './create-group-modal';
import { ManageGroupsModal } from './manage-groups-modal';
import { AgePhase, EventNode, LifeEvent, SlotType } from '@/lib/generator/types';
import { GenerateEventsDialog } from './generate-events-dialog';
import { Badge } from "@/components/ui/badge";
import { useBioStore } from "@/lib/store/bioStore";
import { SelectionToolbar } from './selection-toolbar';
import { v4 as uuidv4 } from 'uuid';
import { stringToColor, stringToLightColor } from "@/lib/utils/colors";

interface BioDatasetEditorProps {
    data: (EventNode | LifeEvent)[];
    type: 'CHILDHOOD' | 'FORMATIVE' | 'PROFESSIONAL' | 'SENIOR' | 'LIFE_EVENT'; // The target type for new items
    phase?: AgePhase; // The active phase context
    onAdd: (item: any) => void;
    onUpdate: (item: any) => void;
    onDelete: (id: string) => void;
    title: string;
    description: string;
}

export function BioDatasetEditor({ data, type, phase, onAdd, onUpdate, onDelete, title, description }: BioDatasetEditorProps) {
    const { groups } = useBioStore();
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<EventNode | LifeEvent | undefined>(undefined);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isManageGroupsModalOpen, setIsManageGroupsModalOpen] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);

    const filteredData = data.filter(item => {
        // Search Filter
        const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) ||
            item.text.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        // Phase Filter
        if (phase) {
            // Check 'phase' property (single)
            if ('phase' in item && item.phase === phase) return true;
            // Check 'phases' property (multiple)
            if ('phases' in item && item.phases?.includes(phase)) return true;
            return false;
        }

        return true;
    });

    const existingIds = data.map(i => i.id);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredData.map(i => i.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleGroupSave = (groupData: { name: string; description?: string }) => {
        const newGroup = {
            id: uuidv4(),
            ...groupData
        };

        useBioStore.getState().addGroup(newGroup);

        // Update selected items with new group ID
        selectedIds.forEach(id => {
            const item = data.find(i => i.id === id);
            if (item && 'slot' in item) {
                onUpdate({ ...item, groupId: newGroup.id });
            }
        });

        setSelectedIds(new Set());
        setIsGroupModalOpen(false);
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
            selectedIds.forEach(id => onDelete(id));
            setSelectedIds(new Set());
        }
    };

    const handleCreate = () => {
        setEditingItem(undefined);
        setEditorMode('create');
        setIsEditorOpen(true);
    };

    const handleEdit = (item: EventNode | LifeEvent) => {
        setEditingItem(item);
        setEditorMode('edit');
        setIsEditorOpen(true);
    };

    const handleDuplicate = (item: EventNode | LifeEvent) => {
        // Create a copy with a suffixed ID
        const copy = {
            ...item,
            id: `${item.id}_copy`
        };
        setEditingItem(copy);
        setEditorMode('create'); // Treat as create so checks work correctly
        setIsEditorOpen(true);
    };

    const handleSave = (item: EventNode | LifeEvent) => {
        // Automatically register tags in the global database
        const tagsToRegister = new Set<string>();
        item.provides?.forEach(t => tagsToRegister.add(t));
        if ('requires' in item) item.requires?.forEach(t => tagsToRegister.add(t));
        if (item.weights) {
            Object.keys(item.weights).forEach(t => {
                if (t !== 'DEFAULT') tagsToRegister.add(t);
            });
        }
        if (tagsToRegister.size > 0) {
            useBioStore.getState().registerTags(Array.from(tagsToRegister));
        }

        if (editorMode === 'edit' && editingItem) {
            // Check for ID Rename
            if (editingItem.id !== item.id) {
                // Renamed: Delete old + Add new
                onDelete(editingItem.id);
                onAdd(item);
            } else {
                // Same ID: Update
                onUpdate(item);
            }
        } else {
            // Create (New or Duplicate)
            onAdd(item);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New {type === 'LIFE_EVENT' ? 'Event' : 'Entry'}
                </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <Input
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <SelectionToolbar
                    selectedCount={selectedIds.size}
                    onDelete={handleBulkDelete}
                >
                    {type === 'LIFE_EVENT' && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowGenerator(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gen Events
                        </Button>
                    )}

                    {type !== 'LIFE_EVENT' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsGroupModalOpen(true)}
                            disabled={selectedIds.size === 0}
                        >
                            <FolderPlus className="w-4 h-4 mr-2" />
                            Group
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsManageGroupsModalOpen(true)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Groups
                    </Button>
                </SelectionToolbar>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <input
                                    type="checkbox"
                                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="translate-y-[2px]"
                                />
                            </TableHead>
                            <TableHead className="w-[120px]">ID</TableHead>
                            <TableHead>Text</TableHead>
                            {type !== 'LIFE_EVENT' && <TableHead>Group</TableHead>}
                            {type === 'LIFE_EVENT' && <TableHead>Age Phases</TableHead>}
                            <TableHead>Provides</TableHead>
                            <TableHead>Requires</TableHead>
                            <TableHead>Influenced by</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id} data-state={selectedIds.has(item.id) ? "selected" : undefined}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                                            className="translate-y-[2px]"
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] break-all">{item.id}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={item.text}>
                                        {item.text}
                                    </TableCell>
                                    {type !== 'LIFE_EVENT' && (
                                        <TableCell>
                                            {'groupId' in item && item.groupId ? (
                                                <Badge
                                                    variant="outline"
                                                    style={{
                                                        backgroundColor: stringToLightColor(item.groupId),
                                                        color: '#1e293b', // Slate-800 for readability
                                                        borderColor: stringToColor(item.groupId)
                                                    }}
                                                >
                                                    <span
                                                        className="mr-1.5 inline-block w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: stringToColor(item.groupId) }}
                                                    />
                                                    {groups.find(g => g.id === item.groupId)?.name || 'Unknown Group'}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">None</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {type === 'LIFE_EVENT' && (
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {('phase' in item && item.phase) && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                                        {item.phase}
                                                    </Badge>
                                                )}
                                                {('phases' in item && item.phases) && item.phases.map(p => (
                                                    <Badge key={p} variant="outline" className="text-[10px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.provides?.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>
                                            ))}
                                            {(item.provides?.length || 0) > 3 && (
                                                <span className="text-xs text-muted-foreground">+{item.provides!.length - 3}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {'requires' in item && item.requires && (
                                            <div className="flex flex-wrap gap-1">
                                                {item.requires.slice(0, 3).map(t => (
                                                    <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                                                ))}
                                                {(item.requires.length || 0) > 3 && (
                                                    <span className="text-xs text-muted-foreground">+{item.requires.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(item.weights || {}).map(([tag, weight]) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 border-blue-200 bg-blue-50 text-blue-700">
                                                    {tag}:{weight}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)} title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDuplicate(item)} title="Duplicate">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)} title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <BioEntityEditor
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                initialData={editingItem}
                onSave={handleSave}
                type={type}
                phase={phase}
                existingIds={existingIds}
                mode={editorMode}
            />

            <CreateGroupModal
                open={isGroupModalOpen}
                onOpenChange={setIsGroupModalOpen}
                onSave={handleGroupSave}
            />

            <ManageGroupsModal
                open={isManageGroupsModalOpen}
                onOpenChange={setIsManageGroupsModalOpen}
            />

            <GenerateEventsDialog
                open={showGenerator}
                onOpenChange={setShowGenerator}
                sourceEntity={undefined}
            />
        </div>
    );
}