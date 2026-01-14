import { useBioStore } from "@/lib/store/bioStore";
import { AgePhase, PhaseConfig } from "@/lib/generator/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BioPhaseSettings() {
    const { phaseConfig, updatePhaseConfig } = useBioStore();

    const handleChange = (phase: AgePhase, field: keyof PhaseConfig, value: string) => {
        const numValue = field === 'eventChance' ? parseFloat(value) : parseInt(value);
        if (isNaN(numValue)) return;
        
        updatePhaseConfig(phase, { [field]: numValue });
    };

    const phases = Object.keys(phaseConfig) as AgePhase[];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {phases.map((phase) => (
                <Card key={phase}>
                    <CardHeader className="pb-3">
                        <CardTitle>{phase}</CardTitle>
                        <CardDescription>
                            Configuration for the {phase} life phase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Start Age</Label>
                                <Input 
                                    type="number" 
                                    value={phaseConfig[phase].startAge} 
                                    onChange={(e) => handleChange(phase, 'startAge', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">End Age</Label>
                                <Input 
                                    type="number" 
                                    value={phaseConfig[phase].endAge} 
                                    onChange={(e) => handleChange(phase, 'endAge', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Sim. Interval (Yrs)</Label>
                                <Input 
                                    type="number" 
                                    value={phaseConfig[phase].simulationInterval} 
                                    onChange={(e) => handleChange(phase, 'simulationInterval', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Event Chance (0-1)</Label>
                                <Input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={phaseConfig[phase].eventChance} 
                                    onChange={(e) => handleChange(phase, 'eventChance', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
