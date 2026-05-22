import { PROJECT_PRESETS } from "./presets.js";
import { getSettings, listProjects, updateSettings, upsertProject } from "./projects.js";
import type { ProjectManifest } from "./types.js";

export async function importPresetsFromDocs(
  fetchServicesDoc: (fileName: string) => Promise<string | null>
): Promise<{ imported: string[]; skipped: string[] }> {
  const existing = await listProjects();
  const imported: string[] = [];
  const skipped: string[] = [];

  for (const preset of PROJECT_PRESETS) {
    if (existing.some((p) => p.slug === preset.slug)) {
      skipped.push(preset.slug);
      continue;
    }

    const doc = await fetchServicesDoc(preset.servicesDocFile);
    const now = new Date().toISOString();
    const manifest: ProjectManifest = {
      slug: preset.slug,
      name: preset.name,
      stackType: preset.stackType,
      productionUrl: preset.productionUrl,
      repoPath: "",
      servicesDocPath: preset.servicesDocFile,
      servicesPrivatePath: preset.servicesPrivateFile,
      currency: preset.currency,
      connectors: preset.defaultConnectors.map((c) => ({ ...c, config: { ...c.config } })),
      createdAt: now,
      updatedAt: now,
    };

    await upsertProject(manifest);
    imported.push(preset.slug);
  }

  await updateSettings({ importedPresets: true });
  return { imported, skipped };
}

export async function shouldOfferPresetImport(): Promise<boolean> {
  const settings = await getSettings();
  const projects = await listProjects();
  return !settings.importedPresets && projects.length === 0;
}
