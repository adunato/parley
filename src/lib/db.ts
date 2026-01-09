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
    keyvalues!: Table<KeyValueData>;

    constructor() {
        super('ParleyDB');
        this.version(1).stores({
            projects: 'id, name, lastModified',
            keyvalues: 'key'
        });
    }
}

export const db = new ParleyDexie();
