import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkAnthropic(
  _project: ProjectManifest,
  _config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const key = getSecret("anthropic:apiKey");
  if (!key) {
    return {
      id: "anthropic",
      status: "pending",
      label: "Anthropic",
      message: "API key not configured",
      checkedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(12000),
    });
    return {
      id: "anthropic",
      status: res.ok ? "ok" : "error",
      label: "Anthropic",
      message: res.ok ? "API key valid" : `API ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: "anthropic",
      status: "error",
      label: "Anthropic",
      message: e instanceof Error ? e.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "anthropic",
  label: "Anthropic",
  icon: "Cpu",
  description: "Validates Anthropic API key. Note: usage stats require the Anthropic console.",
  configSchema: [],
  secretKeys: ["anthropic:apiKey"],
  aiSummaryPrompt: "Report API key validity status.",
  run: checkAnthropic,
});

export { checkAnthropic };
