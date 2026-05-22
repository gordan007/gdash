import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkGithub(
  _project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const owner = config.owner;
  const repo = config.repo;
  const token = getSecret(`github:${owner}/${repo}`) ?? getSecret("github:token");

  if (!owner || !repo) {
    return {
      id: "github",
      status: "pending",
      label: "GitHub CI",
      message: "Configure owner and repo",
      checkedAt: new Date().toISOString(),
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`,
      { headers, signal: AbortSignal.timeout(15000) }
    );

    const rateLimitRemaining = Number(res.headers.get("X-RateLimit-Remaining") ?? 60);
    const rateLimitLimit = Number(res.headers.get("X-RateLimit-Limit") ?? 60);

    if (res.status === 401) {
      return {
        id: "github",
        status: "warn",
        label: "GitHub CI",
        message: "Invalid or missing token",
        checkedAt: new Date().toISOString(),
      };
    }
    if (!res.ok) {
      return {
        id: "github",
        status: "error",
        label: "GitHub CI",
        message: `API ${res.status}`,
        checkedAt: new Date().toISOString(),
      };
    }
    const data = (await res.json()) as {
      workflow_runs?: { conclusion?: string; status?: string; html_url?: string }[];
    };
    const run = data.workflow_runs?.[0];
    if (!run) {
      return {
        id: "github",
        status: "warn",
        label: "GitHub CI",
        message: "No workflow runs yet",
        checkedAt: new Date().toISOString(),
        meta: { rateLimitRemaining, rateLimitLimit },
      };
    }
    const ok = run.conclusion === "success";
    const running = run.status === "in_progress" || run.status === "queued";
    return {
      id: "github",
      status: running ? "loading" : ok ? "ok" : "error",
      label: "GitHub CI",
      message: running
        ? `Running (${run.status})`
        : `Last: ${run.conclusion ?? "unknown"}`,
      checkedAt: new Date().toISOString(),
      meta: {
        url: run.html_url ?? "",
        rateLimitRemaining,
        rateLimitLimit,
      },
    };
  } catch (e) {
    return {
      id: "github",
      status: "error",
      label: "GitHub CI",
      message: e instanceof Error ? e.message : "Request failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "github",
  label: "GitHub CI",
  icon: "GitBranch",
  description: "Latest workflow run status from GitHub Actions.",
  configSchema: [
    { key: "owner", label: "Owner / org", type: "text", required: true, placeholder: "gordan007" },
    { key: "repo", label: "Repository", type: "text", required: true, placeholder: "my-app" },
  ],
  secretKeys: ["github:token"],
  aiSummaryPrompt: "Summarize CI status and rate limit usage.",
  run: checkGithub,
});

export { checkGithub };
