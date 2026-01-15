"use client";

import { useBioGraphContext } from './bio-graph-context';
import { useBioStore } from '@/lib/store/bioStore';
import { AGE_PHASES } from '@/lib/generator/types';
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function BioGraphFilterToolbar() {
    const {
        hiddenPhases, togglePhaseVisibility,
        hiddenTypes, toggleTypeVisibility,
        highlightedGroupId, setHighlightedGroupId
    } = useBioGraphContext();

    // Subscribe to groups from store
    const groups = useBioStore(state => state.groups);

    return (
        <div className="flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-sm border rounded shadow text-sm w-[250px]">
            <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground pb-1 border-b">Filters</div>

            {/* Phase Filters */}
            <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.values(AGE_PHASES).map((phaseConfig) => (
                    <div key={phaseConfig.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`filter-${phaseConfig.id}`}
                            checked={!hiddenPhases.has(phaseConfig.id)}
                            onChange={() => togglePhaseVisibility(phaseConfig.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <Label htmlFor={`filter-${phaseConfig.id}`} className="text-xs font-normal cursor-pointer">{phaseConfig.id}</Label>
                    </div>
                ))}
            </div>

            {/* Life Events Filter */}
            <div className="flex items-center space-x-2 mt-1 border-t pt-2">
                <input
                    type="checkbox"
                    id="filter-life-events"
                    checked={!hiddenTypes.has('LIFE_EVENT')}
                    onChange={() => toggleTypeVisibility('LIFE_EVENT')}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="filter-life-events" className="text-xs font-normal cursor-pointer">Life Events</Label>
            </div>

            {/* Group Selector */}
            <div className="mt-2 border-t pt-2">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Highlight Group</div>
                <Select
                    value={highlightedGroupId || "none"}
                    onValueChange={(val) => setHighlightedGroupId(val === "none" ? null : val)}
                >
                    <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select a group..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
