import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, Save } from "lucide-react"
import { useParleyStore, PlayerPersona } from "@/lib/store"

export default function PersonaConfiguration() {
    const { playerPersona, setPlayerPersona } = useParleyStore()
    const [editedPersona, setEditedPersona] = useState<PlayerPersona | null>(null)

    useEffect(() => {
        if (playerPersona) {
            setEditedPersona({ ...playerPersona })
        } else {
            // Initialize with a default persona if none exists
            setEditedPersona({
                name: "",
                alias: "",
                reputation: "",
                background: "",
                firstImpression: "",
                role: "",
                faction: "",
                avatar: "",
            })
        }
    }, [playerPersona])

    const handleSave = () => {
        if (editedPersona) {
            setPlayerPersona(editedPersona)
        }
    }

    const handleInputChange = (field: keyof PlayerPersona, value: string) => {
        setEditedPersona((prev) => (prev ? { ...prev, [field]: value } : null))
    }

    if (!editedPersona) {
        return <div>Loading persona...</div>
    }

    return (
        <div className="flex flex-col space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Player Persona
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editedPersona.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alias">Alias</Label>
                            <Input
                                id="alias"
                                value={editedPersona.alias}
                                onChange={(e) => handleInputChange("alias", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reputation">Reputation</Label>
                        <Textarea
                            id="reputation"
                            value={editedPersona.reputation || ""}
                            onChange={(e) => handleInputChange("reputation", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="background">Background</Label>
                        <Textarea
                            id="background"
                            value={editedPersona.background || ""}
                            onChange={(e) => handleInputChange("background", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="firstImpression">First Impression</Label>
                        <Textarea
                            id="firstImpression"
                            value={editedPersona.firstImpression || ""}
                            onChange={(e) => handleInputChange("firstImpression", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={editedPersona.role || ""}
                                onChange={(e) => handleInputChange("role", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faction">Faction</Label>
                            <Input
                                id="faction"
                                value={editedPersona.faction || ""}
                                onChange={(e) => handleInputChange("faction", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                            id="avatar"
                            value={editedPersona.avatar || ""}
                            onChange={(e) => handleInputChange("avatar", e.target.value)}
                        />
                    </div>

                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Persona
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
