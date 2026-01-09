import { StateStorage } from 'zustand/middleware';
import { db } from './db';

export const DexieStorageAdapter: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        const item = await db.keyvalues.get(name);
        return item ? item.value : null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await db.keyvalues.put({ key: name, value });
    },
    removeItem: async (name: string): Promise<void> => {
        await db.keyvalues.delete(name);
    },
};
