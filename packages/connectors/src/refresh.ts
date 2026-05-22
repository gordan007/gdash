import {
  getProjectCache,
  loadProjectCosts,
  parseChecklistFromServices,
  setProjectCache,
  type ConnectorResult,
  type ProjectCache,
  type ProjectManifest,
} from "@gdash/core";
import { runConnector, type ConnectorDeps } from "./run.js";

const PREFERRED_ORDER = [
  "http",
  "github",
  "checklist",
  "vercel",
  "plausible",
  "supabase",
  "firebase",
  "anthropic",
  "revenuecat",
  "lemonsqueezy",
];

async function runWithTimeout(
  promise: Promise<ConnectorResult>,
  ms: number,
  id: string
): Promise<ConnectorResult> {
  const timeout = new Promise<ConnectorResult>((resolve) =>
    setTimeout(
      () =>
        resolve({
          id,
          status: "error",
          label: id,
          message: `Timed out after ${ms / 1000}s`,
          checkedAt: new Date().toISOString(),
        }),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}

export async function refreshProject(
  project: ProjectManifest,
  deps: ConnectorDeps,
  options?: { connectorIds?: string[] }
): Promise<ProjectCache> {
  const prior = await getProjectCache(project.slug);
  const enabled = project.connectors.filter((c) => c.enabled);
  const ids =
    options?.connectorIds ??
    enabled
      .map((c) => c.id)
      .sort((a, b) => {
        const ai = PREFERRED_ORDER.indexOf(a);
        const bi = PREFERRED_ORDER.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });

  const settled = await Promise.allSettled(
    ids.map((id) => {
      const conf = enabled.find((c) => c.id === id);
      if (!conf) {
        return Promise.resolve<ConnectorResult>({
          id,
          status: "pending",
          label: id,
          message: "Connector disabled",
          checkedAt: new Date().toISOString(),
        });
      }
      return runWithTimeout(
        runConnector(id, project, conf.config, deps),
        15_000,
        id
      );
    })
  );

  const results: ConnectorResult[] = settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    return {
      id: ids[i],
      status: "error" as const,
      label: ids[i],
      message: s.reason instanceof Error ? s.reason.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  });

  let costs = prior?.costs;
  try {
    costs = await loadProjectCosts(project, deps.fetchText);
  } catch {
    /* keep prior */
  }

  let checklist = prior?.checklist ?? [];
  const md = await deps.fetchText(project.servicesDocPath);
  if (md) checklist = parseChecklistFromServices(md);

  const cache: ProjectCache = {
    slug: project.slug,
    connectorResults: mergeResults(prior?.connectorResults ?? [], results),
    checklist,
    costs,
    refreshedAt: new Date().toISOString(),
  };

  await setProjectCache(cache);
  return cache;
}

function mergeResults(
  prior: ConnectorResult[],
  next: ConnectorResult[]
): ConnectorResult[] {
  const map = new Map(prior.map((r) => [r.id, r]));
  for (const r of next) map.set(r.id, r);
  return [...map.values()];
}

export function formatStaleMinutes(refreshedAt: string): number {
  return Math.floor((Date.now() - new Date(refreshedAt).getTime()) / 60000);
}
