import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useBioStore } from "@/lib/store/bioStore";
import { useShallow } from 'zustand/react/shallow';

interface BioGraphSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BioGraphSettingsDialog({ open, onOpenChange }: BioGraphSettingsDialogProps) {
    const { graphSettings, setGraphSettings } = useBioStore(useShallow(state => ({
        graphSettings: state.graphSettings,
        setGraphSettings: state.setGraphSettings
    })));

    // Defaults if not set (should be set by store init, but safe fallback)
    const hSpacing = graphSettings?.horizontalSpacing ?? 300;
    const vSpacing = graphSettings?.verticalSpacing ?? 200;
    const labelPos = graphSettings?.edgeLabelPosition ?? 50;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Graph Layout Settings</DialogTitle>
                    <DialogDescription>
                        Adjust the spacing and appearance of the graph visualization.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="h-spacing">Horizontal Spacing (Rank Sep)</Label>
                            <span className="text-sm font-mono text-muted-foreground">{hSpacing}px</span>
                        </div>
                        <Slider
                            id="h-spacing"
                            min={100}
                            max={1000}
                            step={50}
                            value={[hSpacing]}
                            onValueChange={(vals) => setGraphSettings({ horizontalSpacing: vals[0] })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="v-spacing">Vertical Spacing (Node Sep)</Label>
                            <span className="text-sm font-mono text-muted-foreground">{vSpacing}px</span>
                        </div>
                        <Slider
                            id="v-spacing"
                            min={50}
                            max={500}
                            step={25}
                            value={[vSpacing]}
                            onValueChange={(vals) => setGraphSettings({ verticalSpacing: vals[0] })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="label-pos">Edge Label Position</Label>
                            <span className="text-sm font-mono text-muted-foreground">{labelPos}%</span>
                        </div>
                        <Slider
                            id="label-pos"
                            min={0}
                            max={100}
                            step={5}
                            value={[labelPos]}
                            onValueChange={(vals) => setGraphSettings({ edgeLabelPosition: vals[0] })}
                        />
                        <p className="text-xs text-muted-foreground">
                            0% = Near Source, 100% = Near Target
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
