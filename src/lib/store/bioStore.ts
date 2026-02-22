import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorageAdapter } from '../storage-adapter';
import { EventNode, LifeEvent, SlotType, Tag, AgePhase, PhaseConfig, AGE_PHASES, BioGroup, ConnectionOptions, SymbolicMapping } from '../generator/types';
import { Profession, BaseGameEntity } from '../types';
import { useEntityStore } from '../entityStore';

// Default Data Imports
import childhoodData from '../generator/data/childhood.json';
import formativeData from '../generator/data/formative.json';
import professionalData from '../generator/data/professional.json';
import eventsData from '../generator/data/events.json';
import groupsData from '../generator/data/groups.json';

interface BioStoreState {
    childhood: EventNode[];
    formative: EventNode[];
    professional: EventNode[];
    senior: EventNode[];
    lifeEvents: LifeEvent[];
    tags: Tag[];
    groups: BioGroup[];
    professions: Profession[]; // New Profession Entity
    phaseConfig: Record<AgePhase, PhaseConfig>;
    graphSettings: {
        horizontalSpacing: number;
        verticalSpacing: number;
        edgeLabelPosition: number; // 0-100
    };

    // Actions
    addChildhood: (item: EventNode) => void;
    updateChildhood: (item: EventNode) => void;
    deleteChildhood: (id: string) => void;

    addFormative: (item: EventNode) => void;
    updateFormative: (item: EventNode) => void;
    deleteFormative: (id: string) => void;

    addProfessional: (item: EventNode) => void;
    updateProfessional: (item: EventNode) => void;
    deleteProfessional: (id: string) => void;

    addSenior: (item: EventNode) => void;
    updateSenior: (item: EventNode) => void;
    deleteSenior: (id: string) => void;

    addLifeEvent: (item: LifeEvent) => void;
    updateLifeEvent: (item: LifeEvent) => void;
    deleteLifeEvent: (id: string) => void;

    addTag: (item: Tag) => void;
    updateTag: (item: Tag, oldId?: string) => void;
    deleteTag: (id: string) => void;

    addGroup: (item: BioGroup) => void;
    updateGroup: (item: BioGroup) => void;
    deleteGroup: (id: string) => void;

    connectGroups: (sourceGroupIds: string[], targetGroupIds: string[], options: ConnectionOptions) => void;

    // Profession Actions
    addProfession: (item: Profession) => void;
    updateProfession: (item: Profession) => void;
    deleteProfession: (id: string) => void;

    updatePhaseConfig: (phase: AgePhase, updates: Partial<PhaseConfig>) => void;
    setPhaseConfig: (config: Record<AgePhase, PhaseConfig>) => void;
    setGraphSettings: (settings: Partial<BioStoreState['graphSettings']>) => void;


    // Registers multiple tags if they don't already exist
    registerTags: (tagIds: string[]) => void;

    // Prune unused tags
    pruneUnusedTags: () => void;

    // Symbolic Mappings
    symbolicMappings: SymbolicMapping[];
    addSymbolicMapping: (mapping: SymbolicMapping) => void;
    updateSymbolicMapping: (oldKey: { category: string, key: string }, mapping: SymbolicMapping) => void;
    deleteSymbolicMapping: (category: string, key: string) => void;

    setData: (data: {
        childhood: EventNode[];
        formative: EventNode[];
        professional: EventNode[];
        senior: EventNode[];
        lifeEvents: LifeEvent[];
        tags: Tag[];
        groups: BioGroup[];
        professions?: Profession[];
        phaseConfig?: Record<AgePhase, PhaseConfig>;
        symbolicMappings?: SymbolicMapping[];
    }) => void;

    // Computed
    getAllData: () => {
        childhood: EventNode[];
        formative: EventNode[];
        professional: EventNode[];
        senior: EventNode[];
        lifeEvents: LifeEvent[];
        tags: Tag[];
        groups: BioGroup[];
        professions: Profession[];
        phaseConfig: Record<AgePhase, PhaseConfig>;
        symbolicMappings: SymbolicMapping[];
    };
    getAllMappableEntities: () => BaseGameEntity[];

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useBioStore = create<BioStoreState>()(
    persist(
        (set, get) => ({
            childhood: [],
            formative: [],
            professional: [],
            senior: [],
            lifeEvents: [],
            tags: [],
            groups: [],
            professions: [],
            phaseConfig: AGE_PHASES,
            graphSettings: {
                horizontalSpacing: 300,
                verticalSpacing: 200,
                edgeLabelPosition: 50
            },
            symbolicMappings: [],

            addChildhood: (item) => set((state) => ({ childhood: [...state.childhood, item] })),
            updateChildhood: (item) => set((state) => ({
                childhood: state.childhood.map(i => i.id === item.id ? item : i)
            })),
            deleteChildhood: (id) => set((state) => ({
                childhood: state.childhood.filter(i => i.id !== id)
            })),

            addFormative: (item) => set((state) => ({ formative: [...state.formative, item] })),
            updateFormative: (item) => set((state) => ({
                formative: state.formative.map(i => i.id === item.id ? item : i)
            })),
            deleteFormative: (id) => set((state) => ({
                formative: state.formative.filter(i => i.id !== id)
            })),

            addProfessional: (item) => set((state) => ({ professional: [...state.professional, item] })),
            updateProfessional: (item) => set((state) => ({
                professional: state.professional.map(i => i.id === item.id ? item : i)
            })),
            deleteProfessional: (id) => set((state) => ({
                professional: state.professional.filter(i => i.id !== id)
            })),

            addSenior: (item) => set((state) => ({ senior: [...state.senior, item] })),
            updateSenior: (item) => set((state) => ({
                senior: state.senior.map(i => i.id === item.id ? item : i)
            })),
            deleteSenior: (id) => set((state) => ({
                senior: state.senior.filter(i => i.id !== id)
            })),

            addLifeEvent: (item) => set((state) => ({ lifeEvents: [...state.lifeEvents, item] })),
            updateLifeEvent: (item) => set((state) => ({
                lifeEvents: state.lifeEvents.map(i => i.id === item.id ? item : i)
            })),
            deleteLifeEvent: (id) => set((state) => ({
                lifeEvents: state.lifeEvents.filter(i => i.id !== id)
            })),

            addTag: (item) => set((state) => ({ tags: [...state.tags, item] })),
            updateTag: (item, oldId) => set((state) => {
                const effectiveOldId = oldId || item.id;
                const isRename = effectiveOldId !== item.id;

                if (!isRename) {
                    return {
                        tags: state.tags.map(i => i.id === item.id ? item : i)
                    };
                }

                // Cascading Rename Logic
                const renameInList = (list: any[], field: 'provides' | 'requires') =>
                    list.map(obj => ({
                        ...obj,
                        [field]: obj[field]?.map((t: string) => t === effectiveOldId ? item.id : t)
                    }));

                const renameInWeights = (list: any[]) =>
                    list.map(obj => {
                        if (!obj.weights || obj.weights[effectiveOldId] === undefined) return obj;
                        const newWeights = { ...obj.weights };
                        newWeights[item.id] = newWeights[effectiveOldId];
                        delete newWeights[effectiveOldId];
                        return { ...obj, weights: newWeights };
                    });

                return {
                    tags: state.tags.map(i => i.id === effectiveOldId ? item : i),
                    childhood: renameInList(state.childhood, 'provides'),
                    formative: renameInWeights(renameInList(renameInList(state.formative, 'provides'), 'requires')),
                    professional: renameInWeights(renameInList(state.professional, 'requires')),
                    senior: renameInWeights(renameInList(state.senior, 'requires')),
                    lifeEvents: renameInWeights(renameInList(renameInList(state.lifeEvents, 'provides'), 'requires'))
                };
            }),
            deleteTag: (id) => set((state) => {
                const removeFromList = (list: any[], field: 'provides' | 'requires') =>
                    list.map(obj => ({
                        ...obj,
                        [field]: obj[field]?.filter((t: string) => t !== id)
                    }));

                const removeFromWeights = (list: any[]) =>
                    list.map(obj => {
                        if (!obj.weights || obj.weights[id] === undefined) return obj;
                        const newWeights = { ...obj.weights };
                        delete newWeights[id];
                        return { ...obj, weights: newWeights };
                    });

                return {
                    tags: state.tags.filter(i => i.id !== id),
                    childhood: removeFromList(state.childhood, 'provides'),
                    formative: removeFromWeights(removeFromList(removeFromList(state.formative, 'provides'), 'requires')),
                    professional: removeFromWeights(removeFromList(state.professional, 'requires')),
                    senior: removeFromWeights(removeFromList(state.senior, 'requires')),
                    lifeEvents: removeFromWeights(removeFromList(removeFromList(state.lifeEvents, 'provides'), 'requires'))
                };
            }),

            addGroup: (item) => set((state) => ({ groups: [...state.groups, item] })),
            updateGroup: (item) => set((state) => ({
                groups: state.groups.map(i => i.id === item.id ? item : i)
            })),
            deleteGroup: (id) => set((state) => {
                const unassignGroup = (list: EventNode[]) =>
                    list.map(obj => obj.groupId === id ? { ...obj, groupId: undefined } : obj);

                return {
                    groups: state.groups.filter(i => i.id !== id),
                    childhood: unassignGroup(state.childhood),
                    formative: unassignGroup(state.formative),
                    professional: unassignGroup(state.professional),
                    senior: unassignGroup(state.senior),
                    // Life Events do not support groups currently per requirements
                };
            }),

            addProfession: (item) => set((state) => ({ professions: [...(state.professions || []), item] })),
            updateProfession: (item) => set((state) => ({
                professions: (state.professions || []).map(i => i.id === item.id ? item : i)
            })),
            deleteProfession: (id) => set((state) => ({
                professions: (state.professions || []).filter(i => i.id !== id)
            })),

            connectGroups: (sourceGroupIds, targetGroupIds, options) => set((state) => {
                const allLists = [state.childhood, state.formative, state.professional, state.senior];
                const allItems = allLists.flat();

                // Identify Source and Target Candidates based on Groups
                const sourceItems = allItems.filter(item => item.groupId && sourceGroupIds.includes(item.groupId));
                const targetItems = allItems.filter(item => item.groupId && targetGroupIds.includes(item.groupId));

                if (sourceItems.length === 0 || targetItems.length === 0) return {};

                // Map of SourceItemId -> BridgeTagId
                const sourceTagMap = new Map<string, string>();
                const newTags: Tag[] = [];

                // 1. Determine Tag for EACH Source Item
                sourceItems.forEach(item => {
                    let tagId = '';
                    // Rule 1: Use explicitly provided tag name if given (override all)
                    if (options.tagName) {
                        tagId = options.tagName;
                    }
                    // Rule 2: Use existing first PROVIDES tag
                    else if (item.provides && item.provides.length > 0) {
                        tagId = item.provides[0];
                    }

                    // Rule 3: Generate New Tag
                    if (!tagId) {
                        tagId = `BRIDGE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                        newTags.push({ id: tagId, description: `Auto-generated bridge from ${item.text.substring(0, 20)}...` });
                    }

                    sourceTagMap.set(item.id, tagId);
                });

                // Update Tags List
                let currentTags = [...state.tags];
                if (newTags.length > 0) {
                    currentTags = [...state.tags, ...newTags];
                }

                // Helper to update an item
                const updateItem = (item: EventNode): EventNode => {
                    let newItem = { ...item };
                    let changed = false;

                    // If it is a Source Item, ensure it provides its assigned tag
                    if (sourceTagMap.has(item.id)) {
                        const tagId = sourceTagMap.get(item.id)!;
                        const provides = newItem.provides ? [...newItem.provides] : [];
                        if (!provides.includes(tagId)) {
                            provides.push(tagId);
                            newItem.provides = provides;
                            changed = true;
                        }
                    }

                    // If it is a Target Item, it must accept connections from ALL Source Items in the selected source groups
                    // (Conceptually: Target Group connects to Source Group)
                    const isTarget = item.groupId && targetGroupIds.includes(item.groupId);
                    if (isTarget) {
                        // Project ALL source tags onto this target
                        // Iterate over all unique tags generated/found from source items
                        const allSourceTags = Array.from(new Set(sourceTagMap.values()));

                        allSourceTags.forEach(tagId => {
                            if (options.type === 'HARD') {
                                const requires = newItem.requires ? [...newItem.requires] : [];
                                if (!requires.includes(tagId)) {
                                    requires.push(tagId);
                                    newItem.requires = requires;
                                    changed = true;
                                }
                            } else {
                                const weights = { ...(newItem.weights || { DEFAULT: 10 }) };
                                if (weights[tagId] === undefined) {
                                    weights[tagId] = 50; // Default weight
                                    newItem.weights = weights;
                                    changed = true;
                                }
                            }
                        });
                    }

                    return changed ? newItem : item;
                };

                return {
                    tags: currentTags,
                    childhood: state.childhood.map(updateItem),
                    formative: state.formative.map(updateItem),
                    professional: state.professional.map(updateItem),
                    senior: state.senior.map(updateItem)
                };
            }),

            updatePhaseConfig: (phase, updates) => set((state) => ({
                phaseConfig: {
                    ...state.phaseConfig,
                    [phase]: {
                        ...state.phaseConfig[phase],
                        ...updates
                    }
                }
            })),

            setPhaseConfig: (config) => set({ phaseConfig: config }),

            setGraphSettings: (settings) => set((state) => ({
                graphSettings: { ...state.graphSettings, ...settings }
            })),

            registerTags: (tagIds) => set((state) => {
                const existingTagIds = new Set(state.tags.map(t => t.id));
                const newTags = tagIds
                    .filter(id => !existingTagIds.has(id))
                    .map(id => ({ id }));

                if (newTags.length === 0) return state;
                return { tags: [...state.tags, ...newTags] };
            }),

            pruneUnusedTags: () => set((state) => {
                const usedTags = new Set<string>();

                const collect = (list: any[]) => {
                    if (!list) return;
                    list.forEach(item => {
                        item.provides?.forEach((t: string) => usedTags.add(t));
                        item.requires?.forEach((t: string) => usedTags.add(t));
                        if (item.weights) {
                            Object.keys(item.weights).forEach(t => {
                                if (t !== "DEFAULT") usedTags.add(t);
                            });
                        }
                    });
                };

                collect(state.childhood);
                collect(state.formative);
                collect(state.professional);
                collect(state.senior);
                collect(state.lifeEvents);

                const newTags = state.tags.filter(t => usedTags.has(t.id));

                return { tags: newTags };
            }),


            addSymbolicMapping: (mapping) => set((state) => ({
                symbolicMappings: [...(state.symbolicMappings || []), mapping]
            })),

            updateSymbolicMapping: (oldKey, mapping) => set((state) => ({
                symbolicMappings: (state.symbolicMappings || []).map(m =>
                    (m.category === oldKey.category && m.key === oldKey.key) ? mapping : m
                )
            })),

            deleteSymbolicMapping: (category, key) => set((state) => ({
                symbolicMappings: (state.symbolicMappings || []).filter(m =>
                    !(m.category === category && m.key === key)
                )
            })),

            // Bulk Set (for migration)
            setData: (data) => set({ ...data, professions: data.professions || [], phaseConfig: data.phaseConfig || AGE_PHASES }),

            getAllData: () => ({
                childhood: get().childhood,
                formative: get().formative,
                professional: get().professional,
                senior: get().senior,
                lifeEvents: get().lifeEvents,
                tags: get().tags,
                groups: get().groups,
                professions: get().professions || [],
                phaseConfig: get().phaseConfig,
                symbolicMappings: get().symbolicMappings || []
            }),

            getAllMappableEntities: () => {
                const professions = get().professions || [];
                const attributes = useEntityStore.getState().gameAttributes || [];
                return [...professions, ...attributes];
            },

            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'parley-bio-config',
            storage: createJSONStorage(() => DexieStorageAdapter),
            onRehydrateStorage: () => (state: any) => { // Using any to handle migration from old props
                if (state) {
                    // Check if empty and migrate

                    // Legacy Migration: Map old props to new props if they exist in persistence
                    if (state.origins && !state.childhood) {
                        console.log("BioStore: Migrating 'origins' to 'childhood'");
                        state.childhood = state.origins;
                        delete state.origins;
                    }
                    if (state.education && !state.formative) {
                        console.log("BioStore: Migrating 'education' to 'formative'");
                        state.formative = state.education;
                        delete state.education;
                    }
                    if (state.careers && !state.professional) {
                        console.log("BioStore: Migrating 'careers' to 'professional'");
                        state.professional = state.careers;
                        delete state.careers;
                    }

                    const { childhood, formative, professional, senior, tags } = state;
                    if (!state.groups) state.groups = [];

                    // 1. Seed default data if empty
                    if ((!childhood || childhood.length === 0) && (!formative || formative.length === 0) && (!professional || professional.length === 0) && (senior || []).length === 0) {
                        console.log("BioStore: Migrating default data...");
                        state.childhood = childhoodData;
                        state.formative = formativeData;
                        state.professional = professionalData;
                        state.senior = [];
                        state.lifeEvents = eventsData;
                        state.tags = [];
                        state.groups = groupsData;
                    }

                    // 2. Harvest Tags Migration
                    if ((state.tags || []).length === 0 && (state.childhood?.length > 0 || state.formative?.length > 0)) {
                        console.log("BioStore: Harvesting tags from entities...");
                        const uniqueTags = new Set<string>();

                        const collect = (list: any[]) => {
                            if (!list) return;
                            list.forEach(item => {
                                item.provides?.forEach((t: string) => uniqueTags.add(t));
                                item.requires?.forEach((t: string) => uniqueTags.add(t));
                                if (item.weights) {
                                    Object.keys(item.weights).forEach(t => {
                                        if (t !== "DEFAULT") uniqueTags.add(t);
                                    });
                                }
                            });
                        };

                        collect(state.childhood);
                        collect(state.formative);
                        collect(state.professional);
                        collect(state.senior || []);
                        collect(state.lifeEvents);

                        state.tags = Array.from(uniqueTags).map(id => ({ id }));
                    }

                    // 3. Phased Bio Migration (Assign default phases if missing)
                    const ensurePhases = (list: any[], defaultPhase?: AgePhase, defaultPhases?: AgePhase[]) => {
                        if (!list) return { newList: [], changed: false };
                        let changed = false;
                        const newList = list.map(item => {
                            if (defaultPhase && !item.phase) {
                                changed = true;
                                return { ...item, phase: defaultPhase };
                            }
                            if (defaultPhases && !item.phases) {
                                changed = true;
                                return { ...item, phases: defaultPhases };
                            }
                            return item;
                        });
                        return { newList, changed };
                    };

                    const migrationResult = {
                        childhood: ensurePhases(state.childhood, 'Childhood'),
                        formative: ensurePhases(state.formative, 'Formative'),
                        professional: ensurePhases(state.professional, 'Professional'),
                        senior: ensurePhases(state.senior || [], 'Senior'),
                        lifeEvents: ensurePhases(state.lifeEvents, undefined, ['Childhood', 'Formative', 'Professional', 'Senior'])
                    };

                    if (migrationResult.childhood.changed || migrationResult.formative.changed || migrationResult.professional.changed || migrationResult.senior.changed || migrationResult.lifeEvents.changed) {
                        console.log("BioStore: Migrating entities to support age phases...");
                        state.childhood = migrationResult.childhood.newList;
                        state.formative = migrationResult.formative.newList;
                        state.professional = migrationResult.professional.newList;
                        state.senior = migrationResult.senior.newList;
                        state.lifeEvents = migrationResult.lifeEvents.newList;
                    }

                    // Fix Slot Names in Data (if migrating from old JSONs)
                    const fixSlot = (list: any[], oldSlot: string, newSlot: string) => {
                        if (!list) return;
                        list.forEach(item => {
                            if (item.slot === oldSlot) item.slot = newSlot;
                        });
                    }
                    fixSlot(state.childhood, 'ORIGIN', 'CHILDHOOD');
                    fixSlot(state.formative, 'EDUCATION', 'FORMATIVE');
                    fixSlot(state.professional, 'CAREER', 'PROFESSIONAL');

                    // 5. Ensure Default Groups exist (CR042)
                    if (state.groups) {
                        const existingGroupIds = new Set(state.groups.map((g: any) => g.id));
                        groupsData.forEach((g: any) => {
                            if (!existingGroupIds.has(g.id)) {
                                console.log(`BioStore: Adding missing group '${g.name}'`);
                                state.groups.push(g);
                            }
                        });
                    }

                    state._hasHydrated = true;
                }
            },
        }
    )
);