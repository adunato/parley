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
            const target = this.childhood.find(n => n.id === request.targetChildhoodId);
            if (target) {
                const targetGroupId = target.groupId; // Can be undefined
                validChildhood = validChildhood.filter(node => {
                    // If both share the same group (or both are ungrouped), filter out everything except the target
                    if (node.groupId === targetGroupId) {
                        return node.id === target.id;
                    }
                    // Keep other groups
                    return true;
                });
            }
        }
        if (request.targetProfessionalId) {
            const target = this.professional.find(n => n.id === request.targetProfessionalId);
            if (target) {
                const targetGroupId = target.groupId;
                validProfessional = validProfessional.filter(node => {
                    if (node.groupId === targetGroupId) {
                        return node.id === target.id;
                    }
                    return true;
                });
            }
        }

        // B. Backward Propagation (Professional -> Formative)
        const requiredTagsFromProfessional = new Set<string>();
        validProfessional.forEach(c => c.requires?.forEach(t => requiredTagsFromProfessional.add(t)));

        if (requiredTagsFromProfessional.size > 0) {
            // Group-aware pruning:
            // Only prune groups that are capable of satisfying the requirement.
            // If a group has NO nodes that provide the required tags, it is "unrelated" and should be left alone.

            // 1. Identify groups (and ungrouped)
            const groups: Record<string, EventNode[]> = {};
            const ungrouped: EventNode[] = [];

            validFormative.forEach(node => {
                const gid = node.groupId || 'UNGROUPED';
                if (!groups[gid]) groups[gid] = [];
                groups[gid].push(node);
            });

            let newValidFormative: EventNode[] = [];

            Object.entries(groups).forEach(([gid, nodes]) => {
                // Check if this group can potentially satisfy ANY requirement
                const canSatisfy = nodes.some(n => n.provides?.some(t => requiredTagsFromProfessional.has(t)));

                if (canSatisfy) {
                    // This group is relevant. Prune it to only include satisfying nodes.
                    const satisfyingNodes = nodes.filter(n => n.provides?.some(t => requiredTagsFromProfessional.has(t)));
                    newValidFormative.push(...satisfyingNodes);
                } else {
                    // This group is irrelevant to the requirement. Keep all nodes.
                    newValidFormative.push(...nodes);
                }
            });

            validFormative = newValidFormative;
        }

        // --- 2. Phase Loop Execution ---

        const spine: EventNode[] = [];
        const flesh: LifeEvent[] = [];
        const tags = new Set<string>();
        const selectedEventIds = new Set<string>();

        const phases: AgePhase[] = ['Childhood', 'Formative', 'Professional', 'Senior'];

        for (const phase of phases) {
            // New Check: Skip phases that haven't started yet
            const config = this.phaseConfig[phase];
            if (age < config.startAge) continue;

            // A. Resolve Spine for this phase (Supports multiple groups)
            const phaseSpineNodes = this.resolveMultiGroupPhaseSpine(phase, tags, validChildhood, validFormative, validProfessional, validSenior);

            // Selection Independence: Tags are collected separately and added AFTER all group selections for this phase
            const newSpineTags = new Set<string>();
            phaseSpineNodes.forEach(node => {
                spine.push(node);
                node.provides?.forEach(t => newSpineTags.add(t));
            });
            newSpineTags.forEach(t => tags.add(t));

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

    /**
     * Resolves spine nodes for a phase, allowing one node per group.
     */
    public resolveMultiGroupPhaseSpine(
        phase: AgePhase,
        currentTags: Set<string>,
        validChildhood?: EventNode[],
        validFormative?: EventNode[],
        validProfessional?: EventNode[],
        validSenior?: EventNode[]
    ): EventNode[] {
        const config = this.phaseConfig[phase];
        if (!config.spineSlot) return [];

        let basePool: EventNode[] = [];

        switch (config.spineSlot) {
            case 'CHILDHOOD': basePool = validChildhood || this.childhood; break;
            case 'FORMATIVE': basePool = validFormative || this.formative; break;
            case 'PROFESSIONAL': basePool = validProfessional || this.professional; break;
            case 'SENIOR': basePool = validSenior || this.senior; break;
        }

        // Filter by Phase
        const phasePool = basePool.filter(node => node.phase === phase);

        // Group the nodes
        const groups: Record<string, EventNode[]> = {};
        const ungrouped: EventNode[] = [];

        phasePool.forEach(node => {
            if (node.groupId) {
                if (!groups[node.groupId]) groups[node.groupId] = [];
                groups[node.groupId].push(node);
            } else {
                ungrouped.push(node);
            }
        });

        const selectedNodes: EventNode[] = [];

        // Resolve each group independently
        Object.values(groups).forEach(pool => {
            const selected = this.resolveSpineFromPool(pool, currentTags);
            if (selected) selectedNodes.push(selected);
        });

        // Resolve ungrouped pool
        const selectedUngrouped = this.resolveSpineFromPool(ungrouped, currentTags);
        if (selectedUngrouped) selectedNodes.push(selectedUngrouped);

        return selectedNodes;
    }

    /**
     * Resolves a single spine node from a pool based on requirements and weights.
     */
    public resolveSpineFromPool(pool: EventNode[], currentTags: Set<string>): EventNode | null {
        // Filter by Requirements (Forward Constraint)
        const feasible = pool.filter(node => {
            if (!node.requires) return true;
            return node.requires.every(req => currentTags.has(req));
        });

        if (feasible.length === 0) return null;

        return this.selectWeighted(feasible, currentTags);
    }

    /**
     * Legacy/Helper: Resolves a single node for a phase. 
     * Now uses resolveMultiGroupPhaseSpine and returns the first result if multiple groups exist.
     */
    public resolvePhaseSpine(phase: AgePhase, currentTags: Set<string>, validChildhood?: EventNode[], validFormative?: EventNode[], validProfessional?: EventNode[], validSenior?: EventNode[]): EventNode | null {
        const selected = this.resolveMultiGroupPhaseSpine(phase, currentTags, validChildhood, validFormative, validProfessional, validSenior);
        return selected.length > 0 ? selected[0] : null;
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
                    // If no phases are defined, we treat it as "all phases allowed"
                    if (e.phases && !e.phases.includes(phase)) return false;

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
                    if (weight === 0) {
                        weight = opt.weights[tag];
                    } else {
                        weight *= opt.weights[tag];
                    }
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