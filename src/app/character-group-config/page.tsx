"use client";

import { useState } from "react";
import { useEntityStore } from "@/lib/entityStore";
import { CharacterGroup } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

export default function CharacterGroupConfigPage() {
  const { characterGroups, addCharacterGroup, updateCharacterGroup, deleteCharacterGroup, characters } = useEntityStore();
  const [editingGroup, setEditingGroup] = useState<CharacterGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const handleSaveGroup = () => {
    if (editingGroup) {
      updateCharacterGroup({
        ...editingGroup,
        name: newGroupName,
        description: newGroupDescription,
        characters: selectedCharacters,
      });
      setEditingGroup(null);
    } else {
      const newGroup: CharacterGroup = {
        id: uuidv4(),
        name: newGroupName,
        description: newGroupDescription,
        characters: selectedCharacters,
      };
      addCharacterGroup(newGroup);
    }
    setNewGroupName("");
    setNewGroupDescription("");
    setSelectedCharacters([]);
  };

  const handleEditGroup = (group: CharacterGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description);
    setSelectedCharacters(group.characters);
  };

  const handleDeleteGroup = (id: string) => {
    deleteCharacterGroup(id);
  };

  const handleCharacterSelection = (characterId: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(characterId)
        ? prev.filter((id) => id !== characterId)
        : [...prev, characterId]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="type-h2 mb-6">Character Group Configuration</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="type-h4">{editingGroup ? "Edit Character Group" : "Create New Character Group"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="groupName" className="type-ui-label text-muted-foreground">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="groupDescription" className="type-ui-label text-muted-foreground">Description</Label>
              <Textarea
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
            <div>
              <Label className="type-ui-label text-muted-foreground">Characters in Group</Label>
              <div className="grid grid-cols-2 gap-2">
                {characters.map((character) => (
                  <div key={character.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`char-${character.id}`}
                      checked={selectedCharacters.includes(character.id)}
                      onChange={() => handleCharacterSelection(character.id)}
                    />
                    <Label htmlFor={`char-${character.id}`} className="type-body-sm align-middle">{character.basicInfo.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveGroup}>
              {editingGroup ? "Update Group" : "Create Group"}
            </Button>
            {editingGroup && (
              <Button variant="outline" onClick={() => {
                setEditingGroup(null);
                setNewGroupName("");
                setNewGroupDescription("");
                setSelectedCharacters([]);
              }}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="type-h3 mb-4">Existing Character Groups</h2>
      <div className="grid gap-4">
        {characterGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="type-h4">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="type-body-sm text-muted-foreground mb-2">{group.description}</p>
              <p className="type-ui-label text-muted-foreground mb-1">Characters:</p>
              <ul className="list-disc list-inside type-body-sm">
                {group.characters.map((charId) => {
                  const character = characters.find((c) => c.id === charId);
                  return <li key={charId}>{character ? character.basicInfo.name : "Unknown Character"}</li>;
                })}
              </ul>
              <div className="flex space-x-2 mt-4">
                <Button onClick={() => handleEditGroup(group)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteGroup(group.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
