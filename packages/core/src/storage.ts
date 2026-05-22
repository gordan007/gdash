import { DEFAULT_GDASH_DATA, type GdashData } from "./types.js";
import { migrateData } from "./migrations.js";

const STORAGE_KEY = "gdash-data-v1";

export interface StorageAdapter {
  load(): Promise<GdashData>;
  save(data: GdashData): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<GdashData> {
    if (typeof localStorage === "undefined") {
      return structuredClone(DEFAULT_GDASH_DATA);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_GDASH_DATA);
    try {
      return migrateData(JSON.parse(raw));
    } catch {
      return structuredClone(DEFAULT_GDASH_DATA);
    }
  }

  async save(data: GdashData): Promise<void> {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

let adapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(next: StorageAdapter): void {
  adapter = next;
}

export function getStorageAdapter(): StorageAdapter {
  return adapter;
}

export async function loadGdashData(): Promise<GdashData> {
  return adapter.load();
}

export async function saveGdashData(data: GdashData): Promise<void> {
  await adapter.save(data);
}
