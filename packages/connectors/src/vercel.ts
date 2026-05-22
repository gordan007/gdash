import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkVercel(
  _project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const token = getSecret("vercel:token");
  const projectName = config.projectName;
  if (!token) {
    return {
      id: "vercel",
      status: "pending",
      label: "Vercel",
      message: "Add Vercel token in settings",
      checkedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectName)}&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) {
      const list = await fetch("https://api.vercel.com/v9/projects", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!list.ok) {
        return {
          id: "vercel",
          status: "error",
          label: "Vercel",
          message: `API ${res.status}`,
          checkedAt: new Date().toISOString(),
        };
      }
      const projects = (await list.json()) as { projects?: { name: string; id: string }[] };
      const match = projects.projects?.find((p) => p.name === projectName);
      if (!match) {
        return {
          id: "vercel",
          status: "warn",
          label: "Vercel",
          message: `Project "${projectName}" not found`,
          checkedAt: new Date().toISOString(),
        };
      }
      const depRes = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${match.id}&limit=1`,
        { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) }
      );
      if (!depRes.ok) throw new Error(`deployments ${depRes.status}`);
      const depData = (await depRes.json()) as {
        deployments?: { readyState?: string; url?: string }[];
      };
      const d = depData.deployments?.[0];
      const ready = d?.readyState === "READY";
      return {
        id: "vercel",
        status: ready ? "ok" : "warn",
        label: "Vercel",
        message: d ? `Deploy ${d.readyState}` : "No deployments",
        checkedAt: new Date().toISOString(),
        meta: { url: d?.url ? `https://${d.url}` : "" },
      };
    }
    const data = (await res.json()) as {
      deployments?: { readyState?: string; url?: string }[];
    };
    const d = data.deployments?.[0];
    const ready = d?.readyState === "READY";
    return {
      id: "vercel",
      status: ready ? "ok" : "warn",
      label: "Vercel",
      message: d ? `Deploy ${d.readyState}` : "No deployments",
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: "vercel",
      status: "error",
      label: "Vercel",
      message: e instanceof Error ? e.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "vercel",
  label: "Vercel",
  icon: "Triangle",
  description: "Latest deployment status from Vercel.",
  configSchema: [
    { key: "projectName", label: "Project name", type: "text", required: true, placeholder: "my-app" },
  ],
  secretKeys: ["vercel:token"],
  aiSummaryPrompt: "Summarize the latest Vercel deployment status.",
  run: checkVercel,
});

export { checkVercel };
