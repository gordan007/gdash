import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkPlausible(
  _project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const token = getSecret("plausible:token");
  const domain = config.domain;
  if (!token || !domain) {
    return {
      id: "plausible",
      status: "pending",
      label: "Plausible",
      message: "Token or domain missing",
      checkedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await fetch(
      `https://plausible.io/api/v1/stats/aggregate?site_id=${encodeURIComponent(domain)}&period=7d&metrics=visitors,pageviews`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) {
      return {
        id: "plausible",
        status: "error",
        label: "Plausible",
        message: `API ${res.status}`,
        checkedAt: new Date().toISOString(),
      };
    }
    const data = (await res.json()) as {
      results?: { visitors?: { value: number }; pageviews?: { value: number } };
    };
    const visitors = data.results?.visitors?.value ?? 0;
    const pageviews = data.results?.pageviews?.value ?? 0;
    return {
      id: "plausible",
      status: "ok",
      label: "Plausible",
      message: `7d: ${visitors} visitors, ${pageviews} views`,
      checkedAt: new Date().toISOString(),
      meta: { visitors, pageviews },
    };
  } catch (e) {
    return {
      id: "plausible",
      status: "error",
      label: "Plausible",
      message: e instanceof Error ? e.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "plausible",
  label: "Plausible Analytics",
  icon: "BarChart2",
  description: "7-day visitor and pageview stats from Plausible.",
  configSchema: [
    { key: "domain", label: "Site domain", type: "text", required: true, placeholder: "myapp.com" },
  ],
  secretKeys: ["plausible:token"],
  aiSummaryPrompt: "Summarize 7-day traffic trends.",
  run: checkPlausible,
});

export { checkPlausible };
