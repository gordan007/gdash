import { DEFAULT_GDASH_DATA, type GdashData } from "./types.js";

const CURRENT_VERSION = 1;

function migrateToV1(raw: unknown): GdashData {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    ...DEFAULT_GDASH_DATA,
    ...(typeof data === "object" ? data : {}),
    version: 1,
  } as GdashData;
}

const MIGRATIONS: Record<number, (data: unknown) => GdashData> = {
  1: migrateToV1,
};

export function migrateData(raw: unknown): GdashData {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_GDASH_DATA);
  }
  const data = raw as Record<string, unknown>;
  const version = typeof data.version === "number" ? data.version : 0;

  if (version >= CURRENT_VERSION) {
    return { ...DEFAULT_GDASH_DATA, ...data } as GdashData;
  }

  let current: unknown = raw;
  for (let v = version + 1; v <= CURRENT_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) current = migration(current);
  }
  return current as GdashData;
}
