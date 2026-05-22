import { loadGdashData, saveGdashData } from "./storage.js";
import type { GdashData, ProjectManifest, ProjectCache } from "./types.js";

export async function listProjects(): Promise<ProjectManifest[]> {
  const data = await loadGdashData();
  return data.projects;
}

export async function getProject(slug: string): Promise<ProjectManifest | undefined> {
  const data = await loadGdashData();
  return data.projects.find((p) => p.slug === slug);
}

export async function upsertProject(project: ProjectManifest): Promise<void> {
  const data = await loadGdashData();
  const idx = data.projects.findIndex((p) => p.slug === project.slug);
  const next = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) data.projects[idx] = next;
  else data.projects.push(next);
  await saveGdashData(data);
}

export async function deleteProject(slug: string): Promise<void> {
  const data = await loadGdashData();
  data.projects = data.projects.filter((p) => p.slug !== slug);
  delete data.cache[slug];
  await saveGdashData(data);
}

export async function getProjectCache(slug: string): Promise<ProjectCache | undefined> {
  const data = await loadGdashData();
  return data.cache[slug];
}

export async function setProjectCache(cache: ProjectCache): Promise<void> {
  const data = await loadGdashData();
  data.cache[cache.slug] = cache;
  await saveGdashData(data);
}

export async function updateSettings(
  partial: Partial<GdashData["settings"]>
): Promise<void> {
  const data = await loadGdashData();
  data.settings = { ...data.settings, ...partial };
  await saveGdashData(data);
}

export async function getSettings(): Promise<GdashData["settings"]> {
  const data = await loadGdashData();
  return data.settings;
}
