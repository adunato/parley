"use client";

import { useEffect, useState, useRef } from "react";
import { useEntityStore } from "@/lib/entityStore";
import { CharacterGroup } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import { useDebouncedCallback } from "use-debounce";
import { Users, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function CharacterGroupConfigPage() {
  const { characterGroups, addCharacterGroup, updateCharacterGroup, deleteCharacterGroup, characters } = useEntityStore();

  // Selection
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Local state
  const [localGroup, setLocalGroup] = useState<CharacterGroup | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isDirtyRef = useRef(false);

  // Debounced save
  const debouncedSave = useDebouncedCallback((group: CharacterGroup) => {
    setSaveStatus('saving');
    try {
      updateCharacterGroup(group);
      setSaveStatus('saved');
      isDirtyRef.current = false;
      setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
    } catch (error) {
      console.error("Failed to save group", error);
      setSaveStatus('error');
    }
  }, 1000);

  // Sync selection
  const selectedGroupStore = characterGroups.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (selectedGroupStore) {
      if (!isDirtyRef.current || localGroup?.id !== selectedGroupStore.id) {
        setLocalGroup(selectedGroupStore);
      }
    } else {
      if (!selectedGroupId) {
        setLocalGroup(null);
        // Select first if available and none selected
        if (characterGroups.length > 0) {
          setSelectedGroupId(characterGroups[0].id);
        }
      }
    }
  }, [selectedGroupId, selectedGroupStore, characterGroups]);

  const handleSelect = (id: string) => {
    if (localGroup && isDirtyRef.current) {
      debouncedSave.flush();
    }
    setSelectedGroupId(id);
  };

  const handleAddGroup = () => {
    if (localGroup && isDirtyRef.current) {
      debouncedSave.flush();
    }
    const newGroup: CharacterGroup = {
      id: uuidv4(),
      name: "New Group",
      description: "",
      characters: [],
    };
    addCharacterGroup(newGroup);
    setSelectedGroupId(newGroup.id);
    setLocalGroup(newGroup);
    isDirtyRef.current = false;
  };

  const handleDeleteGroup = (id: string) => {
    deleteCharacterGroup(id);
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
      setLocalGroup(null);
    }
  };

  const handleInputChange = (field: keyof CharacterGroup, value: any) => {
    setLocalGroup(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      isDirtyRef.current = true;
      setSaveStatus('saving');
      debouncedSave(updated);
      return updated;
    });
  };

  const handleToggleMember = (characterId: string) => {
    setLocalGroup(prev => {
      if (!prev) return null;
      const currentMembers = prev.characters || [];
      const newMembers = currentMembers.includes(characterId)
        ? currentMembers.filter(id => id !== characterId)
        : [...currentMembers, characterId];

      const updated = { ...prev, characters: newMembers };
      // Immediate save for membership toggles usually feels better, but consistent debounce is fine too.
      // Let's stick to debounce for consistency, but maybe shorter?
      // Actually, for check/uncheck, immediate visual feedback is handled by local state.
      isDirtyRef.current = true;
      setSaveStatus('saving');
      debouncedSave(updated);
      return updated;
    });
  };

  return (
    <div className="flex h-screen bg-muted/10">
      {/* Sidebar */}
      <div className="w-80 bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="type-ui-label text-muted-foreground">Groups</h2>
          <Button size="sm" variant="ghost" onClick={handleAddGroup} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {characterGroups.map(group => (
            <div
              key={group.id}
              onClick={() => handleSelect(group.id)}
              className={`p-4 border-b border-border/50 cursor-pointer transition-all ${selectedGroupId === group.id
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-accent/50 border-l-2 border-l-transparent"
                }`}
            >
              <div className="font-medium truncate">{group.name}</div>
              <div className="text-xs text-muted-foreground truncate">{group.characters.length} members</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {localGroup ? (
          <>
            <div className="bg-muted/30 border-b border-border p-6 md:p-12 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="type-h2 text-foreground">{localGroup.name}</h1>
                  <p className="type-ui-label text-muted-foreground">{localGroup.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                    {saveStatus === 'saving' && (
                      <span className="text-muted-foreground flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="text-green-500 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Saved
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="text-destructive flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteGroup(localGroup.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl space-y-6">
                <Card>
                  <div className="pt-6">
                    <SectionHeader title="Group Details" />
                  </div>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName" className="type-ui-label text-muted-foreground">Name</Label>
                      <Input
                        id="groupName"
                        value={localGroup.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupDesc" className="type-ui-label text-muted-foreground">Description</Label>
                      <Textarea
                        id="groupDesc"
                        value={localGroup.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <div className="pt-6">
                    <SectionHeader title="Members" />
                  </div>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {characters.map(char => {
                        const isMember = localGroup.characters.includes(char.id);
                        return (
                          <div
                            key={char.id}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${isMember ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-accent/50"
                              }`}
                            onClick={() => handleToggleMember(char.id)}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isMember ? "bg-primary border-primary" : "border-muted-foreground"
                              }`}>
                              {isMember && <Users className="w-2.5 h-2.5 text-primary-foreground" />}
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={char.basicInfo.avatar} />
                              <AvatarFallback>{char.basicInfo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{char.basicInfo.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{char.basicInfo.role}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a group or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
