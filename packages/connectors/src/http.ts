import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkHttp(
  project: ProjectManifest,
  config: Record<string, string>,
  _deps: ConnectorDeps
): Promise<ConnectorResult> {
  const url = config.url || project.productionUrl;
  const start = Date.now();

  // First try normal HEAD request
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(12000),
    });
    const ms = Date.now() - start;
    const ok = res.ok || res.status === 405;
    return {
      id: "http",
      status: ok ? "ok" : "error",
      label: "Site",
      message: ok ? `HTTP ${res.status} (${ms}ms)` : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
      meta: { statusCode: res.status, latencyMs: ms },
    };
  } catch {
    // Fallback: no-cors mode — gets opaque response (status 0) if server is up,
    // throws if server is truly unreachable
    try {
      await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        signal: AbortSignal.timeout(12000),
      });
      const ms = Date.now() - start;
      // Opaque response = server responded, site is up
      return {
        id: "http",
        status: "ok",
        label: "Site",
        message: `Reachable (${ms}ms)`,
        checkedAt: new Date().toISOString(),
        meta: { latencyMs: ms },
      };
    } catch (e) {
      return {
        id: "http",
        status: "error",
        label: "Site",
        message: e instanceof Error ? e.message : "Unreachable",
        checkedAt: new Date().toISOString(),
      };
    }
  }
}

registerConnector({
  id: "http",
  label: "Site health",
  icon: "Globe",
  description: "HEAD request to production URL — checks uptime and latency.",
  configSchema: [
    { key: "url", label: "Override URL", type: "url", required: false, placeholder: "https://…" },
  ],
  aiSummaryPrompt: "Report site uptime status and latency in one sentence.",
  run: checkHttp,
});

export { checkHttp };
