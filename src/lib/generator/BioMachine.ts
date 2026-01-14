import { BioGenerationRequest, BioState, BioData, EventNode, LifeEvent, Tag, AgePhase, AGE_PHASES, SlotType, PhaseConfig } from './types';

// --- The Engine ---

export class BioMachine {

    private childhood: EventNode[];
    private formative: EventNode[];
    private professional: EventNode[];
    private senior: EventNode[];
    private lifeEvents: LifeEvent[];
    private tags: Tag[];
    private phaseConfig: Record<AgePhase, PhaseConfig>;

    constructor(data: BioData) {
        this.childhood = data.childhood;
        this.formative = data.formative;
        this.professional = data.professional;
        this.senior = data.senior || []; // Default empty if not present
        this.lifeEvents = data.lifeEvents;
        this.tags = data.tags;
        this.phaseConfig = data.phaseConfig || AGE_PHASES;
    }

    public generate(request: BioGenerationRequest): BioState {
        const age = request.age || 30; // Default age

        // --- 1. Pre-Filtering (Constraints & Pinning) ---
        let validChildhood = [...this.childhood];
        let validFormative = [...this.formative];
        let validProfessional = [...this.professional];
        let validSenior = [...this.senior];

        // A. Pinning
        if (request.targetChildhoodId) {
            validChildhood = validChildhood.filter(node => node.id === request.targetChildhoodId);
        }
        if (request.targetProfessionalId) {
            validProfessional = validProfessional.filter(node => node.id === request.targetProfessionalId);
        }

        // B. Backward Propagation (Professional -> Formative)
        const requiredTagsFromProfessional = new Set<string>();
        validProfessional.forEach(c => c.requires?.forEach(t => requiredTagsFromProfessional.add(t)));

        if (requiredTagsFromProfessional.size > 0) {
            validFormative = validFormative.filter(edu => {
                // Keep if it provides ANY of the required tags OR if professional have no requirements that it fails to meet
                if (!edu.provides) return false;
                return edu.provides.some(tag => requiredTagsFromProfessional.has(tag));
            });
        }

        // --- 2. Phase Loop Execution ---
        
        const spine: EventNode[] = [];
        const flesh: LifeEvent[] = [];
        const tags = new Set<string>();
        const selectedEventIds = new Set<string>();

        const phases: AgePhase[] = ['Childhood', 'Formative', 'Professional', 'Senior'];

        for (const phase of phases) {
            // A. Resolve Spine for this phase
            const spineNode = this.resolvePhaseSpine(phase, tags, validChildhood, validFormative, validProfessional, validSenior);
            if (spineNode) {
                spine.push(spineNode);
                spineNode.provides?.forEach(t => tags.add(t));
            }

            // B. Simulate Flesh for this phase
            const events = this.simulatePhaseFlesh(phase, tags, age, selectedEventIds);
            events.forEach(e => {
                flesh.push(e);
                e.provides?.forEach(t => tags.add(t));
            });
        }

        return {
            spine,
            flesh,
            tags,
            age
        };
    }

    // --- New Phased Logic ---

    public resolvePhaseSpine(phase: AgePhase, currentTags: Set<string>, validChildhood?: EventNode[], validFormative?: EventNode[], validProfessional?: EventNode[], validSenior?: EventNode[]): EventNode | null {
        const config = this.phaseConfig[phase];
        if (!config.spineSlot) return null;

        let pool: EventNode[] = [];
        
        // Select correct pool
        // If valid* arrays are passed (from pinning logic), use them. Otherwise use full instance data.
        switch (config.spineSlot) {
            case 'CHILDHOOD':
                pool = validChildhood || this.childhood;
                break;
            case 'FORMATIVE':
                pool = validFormative || this.formative;
                break;
            case 'PROFESSIONAL':
                pool = validProfessional || this.professional;
                break;
            case 'SENIOR':
                pool = validSenior || this.senior;
                break;
        }

        // Filter by Phase (Strict Mode: Spine Node MUST match the phase)
        pool = pool.filter(node => node.phase === phase);

        // Filter by Requirements (Forward Constraint)
        const feasible = pool.filter(node => {
            if (!node.requires) return true;
            return node.requires.every(req => currentTags.has(req));
        });

        if (feasible.length === 0) return null; // Or throw error if critical?

        return this.selectWeighted(feasible, currentTags);
    }

    public simulatePhaseFlesh(phase: AgePhase, currentTags: Set<string>, targetAge: number, previouslySelectedEventIds: Set<string>): LifeEvent[] {
        const config = this.phaseConfig[phase];
        const events: LifeEvent[] = [];
        
        // Determine Simulation Range
        // Start at phase start. End at min(phase end, target age).
        const start = config.startAge;
        const end = Math.min(config.endAge, targetAge);

        // If target age is below phase start, we skip this phase entirely (or handled by caller)
        if (targetAge < start) return [];

        for (let i = start; i < end; i += config.simulationInterval) {
            // Chance to trigger
            if (Math.random() > (1 - config.eventChance)) {
                // Filter available events
                const availableEvents = this.lifeEvents.filter(e => {
                    // Global Uniqueness Check
                    if (previouslySelectedEventIds.has(e.id)) return false;
                    
                    // Phase Check (Must be in allowed phases for this event)
                    if (!e.phases || !e.phases.includes(phase)) return false;

                    // Requirement Check
                    if (!e.requires) return true;
                    return e.requires.every(req => currentTags.has(req));
                });

                const event = this.selectWeighted(availableEvents, currentTags);
                if (event) {
                    events.push(event);
                    previouslySelectedEventIds.add(event.id);
                    event.provides?.forEach(t => currentTags.add(t));
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