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
        // Initialize valid sets with all available data
        const validSets: Record<AgePhase, EventNode[]> = {
            'Childhood': [...this.childhood],
            'Formative': [...this.formative],
            'Professional': [...this.professional],
            'Senior': [...this.senior]
        };

        const phases: AgePhase[] = ['Childhood', 'Formative', 'Professional', 'Senior'];
        const pinnedIds = new Set(request.pinnedNodeIds || []);

        // Legacy Support: Add legacy targets to pinned set
        if (request.targetChildhoodId) pinnedIds.add(request.targetChildhoodId);
        if (request.targetProfessionalId) pinnedIds.add(request.targetProfessionalId);

        // A. Apply Pinning Constraints (Hard Filter)
        // If a node in a phase is pinned, remove all other nodes for that phase (unless they are in different groups? No, pinning forces selection)
        // Actually, pinning logic needs to be group-aware or slot-aware.
        // Current simplified logic: If a pinned node exists for a phase, it becomes the ONLY option for its group.

        // We need to know which phase a pinned node belongs to.
        // We iterate through all phases and filter the validSets.
        phases.forEach(phase => {
            const potentialNodes = validSets[phase];
            const pinnedNodesInPhase = potentialNodes.filter(n => pinnedIds.has(n.id));

            if (pinnedNodesInPhase.length > 0) {
                // We have pinned nodes in this phase.
                // We must restrict the valid set to ONLY these pinned nodes, 
                // OR we only restrict the groups that these nodes belong to?
                // For now, let's assume pinning is strict: If you pin something, you only get that. 
                // But wait, what if you pin a Career but not an Origin? Origin should be full pool.
                // What if you pin TWO Careers (e.g. multi-classing)? 
                // The prompt implies 1-1 mapping for now.

                // Strategy: For each Group in this phase that has a pinned node, restrict that Group to the pinned node(s).
                // If a Group has NO pinned nodes, it remains full size (unless later restricted by backward prop).

                const groupsWithPins = new Set(pinnedNodesInPhase.map(n => n.groupId || 'UNGROUPED'));

                validSets[phase] = potentialNodes.filter(node => {
                    const gid = node.groupId || 'UNGROUPED';
                    if (groupsWithPins.has(gid)) {
                        return pinnedIds.has(node.id);
                    }
                    return true;
                });
            }
        });

        // B. Generalized Backward Propagation
        let activeRequirements = new Set<string>();

        // Iterate phases in reverse: Senior -> Professional -> Formative -> Childhood
        for (let i = phases.length - 1; i > 0; i--) {
            const currentPhase = phases[i];
            const prevPhase = phases[i - 1];

            const currentNodes = validSets[currentPhase];

            // 1. Add requirements from Pinned Nodes in this phase to the active set
            const pinnedNodes = currentNodes.filter(n => pinnedIds.has(n.id));
            pinnedNodes.forEach(n => n.requires?.forEach(t => activeRequirements.add(t)));

            // If no active requirements, continue
            if (activeRequirements.size === 0) continue;

            // 2. Check if Previous Phase CAN satisfy any active requirements
            const prevNodes = validSets[prevPhase];
            const satisfiedByPrev = new Set<string>();

            prevNodes.forEach(n => n.provides?.forEach(t => {
                if (activeRequirements.has(t)) satisfiedByPrev.add(t);
            }));

            if (satisfiedByPrev.size > 0) {
                // The previous phase acts as a Provider for these tags.
                // We must restrict the previous phase to nodes that Provide one of the satisfied tags
                // (Greedy satisfaction: If you can satisfy it, you must).

                const groups: Record<string, EventNode[]> = {};
                prevNodes.forEach(n => {
                    const gid = n.groupId || 'UNGROUPED';
                    if (!groups[gid]) groups[gid] = [];
                    groups[gid].push(n);
                });

                let newPrevValid: EventNode[] = [];

                Object.entries(groups).forEach(([gid, nodes]) => {
                    // Does this group provide any needed tag?
                    const groupProvidesTags = new Set<string>();
                    nodes.forEach(n => n.provides?.forEach(t => groupProvidesTags.add(t)));

                    const providesNeeded = [...groupProvidesTags].some(t => satisfiedByPrev.has(t));

                    if (providesNeeded) {
                        // Filter to nodes that provide at least one satisfied tag
                        const helpfulNodes = nodes.filter(n => n.provides?.some(t => satisfiedByPrev.has(t)));
                        newPrevValid.push(...helpfulNodes);
                    } else {
                        // This group is irrelevant (orthogonal). Keep all.
                        newPrevValid.push(...nodes);
                    }
                });

                validSets[prevPhase] = newPrevValid;

                // Requirement met! Remove from active set for subsequent iterations (deeper past)
                satisfiedByPrev.forEach(t => activeRequirements.delete(t));
            }
            // If NOT satisfied by prev, activeRequirements carries over to the next iteration (older phase)
        }

        // --- 2. Phase Loop Execution ---

        const spine: EventNode[] = [];
        const flesh: LifeEvent[] = [];
        const tags = new Set<string>();
        const selectedEventIds = new Set<string>();

        // We use the updated validSets
        const validChildhood = validSets['Childhood'];
        const validFormative = validSets['Formative'];
        const validProfessional = validSets['Professional'];
        const validSenior = validSets['Senior'];

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

        // Select the pool based on passed valid sets or default instance data
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
                    const eventWithPhase = { ...event, generatedPhase: phase };
                    events.push(eventWithPhase);
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