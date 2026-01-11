
import { BioGenerationRequest, BioState, BioData, EventNode, LifeEvent } from './types';

// --- The Engine ---

export class BioMachine {

    private origins: EventNode[];
    private education: EventNode[];
    private careers: EventNode[];
    private lifeEvents: LifeEvent[];

    constructor(data: BioData) {
        this.origins = data.origins;
        this.education = data.education;
        this.careers = data.careers;
        this.lifeEvents = data.lifeEvents;
    }

    public generate(request: BioGenerationRequest): BioState {
        const age = request.age || 30; // Default age

        // 1. Layer 1: The Spine (Constraint Solving)
        const spine = this.solveSpine(request);

        // Collect tags from spine
        const tags = new Set<string>();
        spine.forEach(node => node.provides?.forEach(t => tags.add(t)));

        // 2. Layer 2: The Flesh (Simulation)
        const flesh = this.simulateFlesh(tags, age);
        flesh.forEach(event => event.provides?.forEach(t => tags.add(t)));

        return {
            spine,
            flesh,
            tags,
            age
        };
    }

    // --- Layer 1: The Spine ---

    private solveSpine(request: BioGenerationRequest): EventNode[] {
        let validOrigins = [...this.origins];
        let validEducation = [...this.education];
        let validCareers = [...this.careers];

        // A. Pinning (Constraint Application)
        if (request.targetOriginId) {
            validOrigins = validOrigins.filter(node => node.id === request.targetOriginId);
        }
        if (request.targetCareerId) {
            validCareers = validCareers.filter(node => node.id === request.targetCareerId);
        }

        // B. Backward Propagation (Career -> Education)
        // Filter Education: Must provide at least one tag required by ANY valid career options
        // Actually, strictly speaking: if a Career REQUIRES 'A', then Education MUST provide 'A'.
        // If we have multiple valid careers, we keep education nodes that satisfy AT LEAST ONE of them.

        const requiredTagsFromCareers = new Set<string>();
        validCareers.forEach(c => c.requires?.forEach(t => requiredTagsFromCareers.add(t)));

        if (requiredTagsFromCareers.size > 0) {
            validEducation = validEducation.filter(edu => {
                // Keep if it provides ANY of the required tags OR if careers have no requirements that it fails to meet
                // Simplification for V1: If careers require tags, Education MUST provide them.
                if (!edu.provides) return false;
                return edu.provides.some(tag => requiredTagsFromCareers.has(tag));
            });
        }

        // C. Forward Propagation (Origin -> Education)
        // BLOCKED: The logic below incorrectly aggregates requirements. If ONE education node requires a tag 
        // that no origin provides, it filters out ALL origins, causing a crash.
        // We will rely on Step D (Selection) to filter Education nodes based on the *selected* Origin instead.

        /*
        const requiredTagsFromEdu = new Set<string>();
        validEducation.forEach(e => e.requires?.forEach(t => requiredTagsFromEdu.add(t)));
    
        if (requiredTagsFromEdu.size > 0) {
            validOrigins = validOrigins.filter(origin => {
                if (!origin.provides) return false;
                return origin.provides.some(tag => requiredTagsFromEdu.has(tag));
            });
        }
        */

        // Re-Verify Forward (Origin -> Education)
        // If we filtered Origins, we must ensure remaining Education still works with remaining Origins?
        // For V1, let's assume loose coupling.

        // D. Selection (Weighted Random)

        // 1. Pick Origin
        const selectedOrigin = this.selectWeighted(validOrigins, new Set());
        if (!selectedOrigin) throw new Error("BioMachine: No valid Origin found.");

        const currentTags = new Set<string>(selectedOrigin.provides || []);

        // 2. Pick Education
        const feasibleEducation = validEducation.filter(edu => {
            if (!edu.requires) return true;
            return edu.requires.every(req => currentTags.has(req));
        });

        const eduPool = feasibleEducation.length > 0 ? feasibleEducation : validEducation;
        const selectedEducation = this.selectWeighted(eduPool, currentTags);
        // Fallback or Error? Education usually has defaults.
        if (!selectedEducation) throw new Error("BioMachine: No valid Education found.");
        selectedEducation.provides?.forEach(t => currentTags.add(t));

        // 3. Pick Career
        const feasibleCareers = validCareers.filter(car => {
            if (!car.requires) return true;
            return car.requires.every(req => currentTags.has(req));
        });

        const careerPool = feasibleCareers.length > 0 ? feasibleCareers : validCareers;
        const selectedCareer = this.selectWeighted(careerPool, currentTags);
        if (!selectedCareer) throw new Error("BioMachine: No valid Career found.");

        return [selectedOrigin, selectedEducation, selectedCareer];
    }

    // --- Layer 2: The Flesh ---

    private simulateFlesh(tags: Set<string>, age: number): LifeEvent[] {
        const events: LifeEvent[] = [];
        const selectedEventIds = new Set<string>();

        // Simulation Loop: iterate 5 year chunks from 18 to current age
        for (let i = 18; i < age; i += 5) {
            // Chance to trigger an event per chunk
            if (Math.random() > 0.3) { // 70% chance of event
                // Filter out already selected events
                const availableEvents = this.lifeEvents.filter(e => !selectedEventIds.has(e.id));

                const event = this.selectWeighted(availableEvents, tags);
                if (event) {
                    events.push(event);
                    selectedEventIds.add(event.id);
                    event.provides?.forEach(t => tags.add(t));
                }
            }
        }
        return events;
    }

    // --- Utilities ---

    private selectWeighted<T extends { weights: { [key: string]: number; "DEFAULT": number } }>(options: T[], currentTags: Set<string>): T | null {
        if (options.length === 0) return null;

        // Calculate total weight
        let totalWeight = 0;
        const weightedOptions = options.map(opt => {
            // Fix: Check strictly for undefined, allowing 0 to be a valid weight
            let weight = opt.weights["DEFAULT"] !== undefined ? opt.weights["DEFAULT"] : 1;

            // Apply modifiers from tags
            currentTags.forEach(tag => {
                if (opt.weights[tag] !== undefined) {
                    weight *= opt.weights[tag];
                }
            });

            totalWeight += weight;
            return { option: opt, weight };
        });

        if (totalWeight <= 0) return null;

        // Random Selection
        let random = Math.random() * totalWeight;
        for (const item of weightedOptions) {
            random -= item.weight;
            if (random <= 0) return item.option;
        }

        return weightedOptions[0].option; // Should not reach here
    }
}
