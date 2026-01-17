import { useBioStore } from '../store/bioStore';
import { useBioLibraryStore, BioDatasetMetadata } from '../store/bioLibraryStore';
import { db } from '../db';

export interface BioDatasetExport {
    version: number;
    timestamp: string;
    metadata: {
        name: string;
        description?: string;
    };
    data: any; // The bio store data
}

export const BioDatasetService = {

    createNewDataset: async (name: string, description?: string): Promise<string> => {
        const id = crypto.randomUUID();
        const newDataset: BioDatasetMetadata = {
            id,
            name,
            description,
            lastModified: Date.now(),
        };

        // 1. Add to Library
        useBioLibraryStore.getState().addDataset(newDataset);

        // 2. Clear Active State (Set to Defaults)
        // We might want to keep some defaults or clear everything. 
        // For now, let's clear to default empty/seeded state
        // There is no explicit "clear" in bioStore but setData can be used.
        // Actually bioStore initializes with default data if empty.
        // Let's assume we want a fresh start, so we might need a reset action or just load empty.
        // For now, let's just create the entry and assume the user will 'load' it or start editing.
        // Wait, if we create a *new* dataset, we usually expect the UI to switch to it and it be empty.

        // Let's persist the current state as the initial state of this new dataset? 
        // Or simply create an empty one. 
        // Based on "Save As" usually being copy, "New" usually means empty.

        const emptyData = {
            childhood: [],
            formative: [],
            professional: [],
            senior: [],
            lifeEvents: [],
            tags: [],
            groups: [],
            phaseConfig: undefined // Will use default
        };

        const exportData: BioDatasetExport = {
            version: 1,
            timestamp: new Date().toISOString(),
            metadata: { name, description },
            data: emptyData
        };

        await db.bio_datasets.put({
            id,
            name,
            lastModified: Date.now(),
            data: exportData
        });

        // 3. Set as Current
        useBioLibraryStore.getState().setCurrentDatasetId(id);

        // 4. Load it into store
        useBioStore.getState().setData(emptyData);

        return id;
    },

    saveDataset: async (id: string): Promise<void> => {
        const store = useBioStore.getState();
        const library = useBioLibraryStore.getState();
        const dataset = library.getDataset(id);

        if (!dataset) throw new Error("Dataset not found in library");

        const data = store.getAllData();
        // Clean up internal flags if any
        const cleanData = {
            ...data,
            _hasHydrated: undefined
        };

        const exportData: BioDatasetExport = {
            version: 1,
            timestamp: new Date().toISOString(),
            metadata: {
                name: dataset.name,
                description: dataset.description
            },
            data: cleanData
        };

        try {
            await db.bio_datasets.put({
                id,
                name: dataset.name,
                lastModified: Date.now(),
                data: exportData
            });
            library.updateDataset(id, { lastModified: Date.now() });
        } catch (e) {
            console.error("Failed to save dataset", e);
            throw new Error("Failed to save dataset.");
        }
    },

    loadDataset: async (id: string): Promise<void> => {
        try {
            const record = await db.bio_datasets.get(id);
            if (!record) {
                throw new Error(`Dataset ${id} not found locally.`);
            }
            const exportData = record.data as BioDatasetExport;

            // Load into Store
            useBioStore.getState().setData(exportData.data);

            // Set Current ID
            useBioLibraryStore.getState().setCurrentDatasetId(id);

        } catch (e) {
            console.error("Failed to load dataset", e);
            throw new Error("Failed to load dataset.");
        }
    },

    deleteDataset: async (id: string): Promise<void> => {
        useBioLibraryStore.getState().deleteDataset(id);
        await db.bio_datasets.delete(id);
    },

    cloneDataset: async (sourceId: string, newName: string): Promise<string> => {
        // Save current state first if active
        if (useBioLibraryStore.getState().currentDatasetId === sourceId) {
            await BioDatasetService.saveDataset(sourceId);
        }

        const sourceRecord = await db.bio_datasets.get(sourceId);
        if (!sourceRecord) throw new Error("Source dataset not found");

        const newId = crypto.randomUUID();
        const newData = JSON.parse(JSON.stringify(sourceRecord.data)) as BioDatasetExport;
        newData.metadata.name = newName;

        const newMetadata: BioDatasetMetadata = {
            id: newId,
            name: newName,
            description: newData.metadata.description,
            lastModified: Date.now()
        };

        await db.bio_datasets.put({
            id: newId,
            name: newName,
            lastModified: Date.now(),
            data: newData
        });

        useBioLibraryStore.getState().addDataset(newMetadata);
        return newId;
    },

    exportDatasetToJSON: async (id: string): Promise<string> => {
        await BioDatasetService.saveDataset(id);
        const record = await db.bio_datasets.get(id);
        if (!record) throw new Error("Dataset data empty");
        // We probably only want to export the 'data' part or the full wrapper?
        // The existing export functionality exported just the raw data + phaseConfig.
        // To maintain compatibility or improvement, let's export the full wrapper which includes metadata,
        // BUT the user might expect the "World Data" format they are used to.
        // HLD says "Incorporate Import/Export JSON functionality".
        // If we export the wrapper, we can re-import it easily.
        // If we export just the data, it's compatible with other tools potentially.
        // Let's export the INNER data to match previous behavior, OR wrap it?
        // Previous behavior:
        // const exportData = { ...data, phaseConfig: undefined, _hasHydrated: undefined };
        // Wait, previous export explicitly EXCLUDED phaseConfig in handleExportWorld:
        // "Exclude phaseConfig and internal flags"
        // But "Generation Settings" (phaseConfig) was a separate export.

        // IMPORTANT: The HLD implies merging these or keeping them separate?
        // "Incorporate Import/Export JSON functionality as part of the dataset management"
        // If we treat a "Dataset" as the "World Data" (Childhood...Senior + Tags + Groups), 
        // then we should export that.
        // Phase Config (Settings) is conceptually separate in the current code (Settings Tab).
        // BUT, `BioStore` holds `phaseConfig`.
        // If I switch datasets, do I switch generation settings (phases)?
        // Probably YES. A world definition implies its rules.
        // So the Dataset SHOULD include phaseConfig.

        // Let's modify the Export to include phaseConfig if it's part of the world.
        // The previous code had separate "Export World" and "Export Settings".

        // I will assume "Bio Dataset" = EVERYTHING (World + Settings).
        // So the export will contain everything.

        return JSON.stringify(record.data.data, null, 2);
    },

    importDatasetFromJSON: async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);

                    // Simple validation
                    if (!json.childhood && !json.tags) {
                        throw new Error("Invalid world file format");
                    }

                    const newId = crypto.randomUUID();
                    let name = file.name.replace('.json', '');
                    // Try to avoid name collision
                    const existing = useBioLibraryStore.getState().datasets.find(d => d.name === name);
                    if (existing) name = `${name} (Imported)`;

                    const dataToSave = { ...json };
                    // Ensure phaseConfig exists if missing
                    if (!dataToSave.phaseConfig) {
                        // We might default it or leave it undefined to be filled by store default
                    }

                    const exportData: BioDatasetExport = {
                        version: 1,
                        timestamp: new Date().toISOString(),
                        metadata: { name },
                        data: dataToSave
                    };

                    await db.bio_datasets.put({
                        id: newId,
                        name: name,
                        lastModified: Date.now(),
                        data: exportData
                    });

                    useBioLibraryStore.getState().addDataset({
                        id: newId,
                        name: name,
                        lastModified: Date.now()
                    });

                    resolve(newId);

                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
};
