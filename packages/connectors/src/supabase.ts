import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkSupabase(
  _project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const url = config.url ?? getSecret("supabase:url");
  const key = getSecret("supabase:serviceRole");
  if (!url || !key) {
    return {
      id: "supabase",
      status: "pending",
      label: "Supabase",
      message: "URL and service role key required",
      checkedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(12000),
    });
    return {
      id: "supabase",
      status: res.ok || res.status === 400 ? "ok" : "warn",
      label: "Supabase",
      message: res.ok || res.status === 400 ? "Database reachable" : `REST ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: "supabase",
      status: "error",
      label: "Supabase",
      message: e instanceof Error ? e.message : "Unreachable",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "supabase",
  label: "Supabase",
  icon: "Database",
  description: "Database connectivity check via Supabase REST API.",
  configSchema: [
    { key: "url", label: "Project URL", type: "url", required: false, placeholder: "https://xxx.supabase.co", hint: "Or set globally in Settings" },
  ],
  secretKeys: ["supabase:url", "supabase:serviceRole"],
  aiSummaryPrompt: "Summarize Supabase database connectivity status.",
  run: checkSupabase,
});

export { checkSupabase };
