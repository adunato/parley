import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Briefcase, Save, Plus } from "lucide-react"

interface Person {
    id: string
    name: string
    email: string
    phone: string
    role: string
    department: string
    location: string
    bio: string
    status: "active" | "inactive" | "pending"
}

const initialData: Person[] = [
    {
        id: "1",
        name: "Alice Johnson",
        email: "alice.johnson@company.com",
        phone: "+1 (555) 123-4567",
        role: "Senior Developer",
        department: "Engineering",
        location: "San Francisco, CA",
        bio: "Experienced full-stack developer with expertise in React and Node.js. Passionate about creating scalable web applications.",
        status: "active",
    },
    {
        id: "2",
        name: "Bob Smith",
        email: "bob.smith@company.com",
        phone: "+1 (555) 234-5678",
        role: "Product Manager",
        department: "Product",
        location: "New York, NY",
        bio: "Strategic product manager focused on user experience and market research. Leads cross-functional teams to deliver innovative solutions.",
        status: "active",
    },
    {
        id: "3",
        name: "Carol Davis",
        email: "carol.davis@company.com",
        phone: "+1 (555) 345-6789",
        role: "UX Designer",
        department: "Design",
        location: "Austin, TX",
        bio: "Creative UX designer with a passion for user-centered design. Specializes in mobile and web interface design.",
        status: "pending",
    },
    {
        id: "4",
        name: "David Wilson",
        email: "david.wilson@company.com",
        phone: "+1 (555) 456-7890",
        role: "Marketing Specialist",
        department: "Marketing",
        location: "Chicago, IL",
        bio: "Digital marketing expert with focus on content strategy and social media campaigns. Data-driven approach to marketing.",
        status: "inactive",
    },
    {
        id: "5",
        name: "Eva Martinez",
        email: "eva.martinez@company.com",
        phone: "+1 (555) 567-8901",
        role: "Data Analyst",
        department: "Analytics",
        location: "Seattle, WA",
        bio: "Analytical professional specializing in business intelligence and data visualization. Expert in SQL and Python.",
        status: "active",
    },
]

export default function MasterDetailView() {
    const [people, setPeople] = useState<Person[]>(initialData)
    const [selectedId, setSelectedId] = useState<string | null>("1")
    const [editedPerson, setEditedPerson] = useState<Person | null>(null)

    const selectedPerson = people.find((p) => p.id === selectedId)

    const handleSelect = (person: Person) => {
        setSelectedId(person.id)
        setEditedPerson({ ...person })
    }

    const handleSave = () => {
        if (editedPerson) {
            setPeople((prev) => prev.map((p) => (p.id === editedPerson.id ? editedPerson : p)))
            setEditedPerson(null)
        }
    }

    const handleCancel = () => {
        setEditedPerson(null)
    }

    const handleInputChange = (field: keyof Person, value: string) => {
        if (editedPerson) {
            setEditedPerson((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800"
            case "inactive":
                return "bg-red-100 text-red-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const isEditing = editedPerson !== null
    const displayPerson = isEditing ? editedPerson : selectedPerson

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar - Master List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                        <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{people.length} members</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {people.map((person) => (
                        <div
                            key={person.id}
                            onClick={() => handleSelect(person)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedId === person.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <h3 className="font-medium text-gray-900 truncate">{person.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{person.role}</p>
                                    <p className="text-xs text-gray-500 truncate">{person.department}</p>
                                </div>
                                <Badge className={`text-xs ${getStatusColor(person.status)}`}>{person.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content - Detail View */}
            <div className="flex-1 flex flex-col">
                {displayPerson ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{displayPerson.name}</h1>
                                        <p className="text-gray-600">
                                            {displayPerson.role} • {displayPerson.department}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="outline" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setEditedPerson({ ...displayPerson })}>Edit</Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={displayPerson.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={displayPerson.status}
                                                    onValueChange={(value) => handleInputChange("status", value)}
                                                    disabled={!isEditing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Role</Label>
                                                <Input
                                                    id="role"
                                                    value={displayPerson.role}
                                                    onChange={(e) => handleInputChange("role", e.target.value)}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="department">Department</Label>
                                                <Input
                                                    id="department"
                                                    value={displayPerson.department}
                                                    onChange={(e) => handleInputChange("department", e.target.value)}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="w-5 h-5" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={displayPerson.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={displayPerson.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={displayPerson.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" />
                                            Additional Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Biography</Label>
                                            <Textarea
                                                id="bio"
                                                value={displayPerson.bio}
                                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                                disabled={!isEditing}
                                                rows={4}
                                                placeholder="Enter a brief biography..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Selection</h3>
                            <p className="text-gray-500">Select a team member from the list to view their details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
