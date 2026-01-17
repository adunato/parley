import Dexie, { Table } from 'dexie';

export interface ProjectData {
    id: string;
    name: string;
    lastModified: number;
    data: any; // The full project JSON object
}

export interface KeyValueData {
    key: string;
    value: any;
}

export class ParleyDexie extends Dexie {
    projects!: Table<ProjectData>;
    bio_datasets!: Table<ProjectData>; // Reusing ProjectData structure for convenience, or could define BioDatasetData
    keyvalues!: Table<KeyValueData>;

    constructor() {
        super('ParleyDB');
        this.version(1).stores({
            projects: 'id, name, lastModified',
            keyvalues: 'key'
        });
        this.version(2).stores({
            bio_datasets: 'id, name, lastModified'
        });
    }
}

export const db = new ParleyDexie();
