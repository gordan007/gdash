import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkRevenuecat(
  _project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const secretKey = getSecret("revenuecat:secretKey");
  const projectId = config.projectId;

  if (!secretKey) {
    return {
      id: "revenuecat",
      status: "pending",
      label: "RevenueCat",
      message: "Secret key not configured",
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const url = projectId
      ? `https://api.revenuecat.com/v1/projects/${projectId}/products?limit=1`
      : "https://api.revenuecat.com/v1/projects";

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (res.status === 401) {
      return {
        id: "revenuecat",
        status: "error",
        label: "RevenueCat",
        message: "Invalid API key",
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      id: "revenuecat",
      status: res.ok ? "ok" : "warn",
      label: "RevenueCat",
      message: res.ok ? "API key valid" : `API ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: "revenuecat",
      status: "error",
      label: "RevenueCat",
      message: e instanceof Error ? e.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "revenuecat",
  label: "RevenueCat",
  icon: "CreditCard",
  description: "Validates RevenueCat API key for iOS/Android subscriptions.",
  configSchema: [
    { key: "projectId", label: "Project ID (optional)", type: "text", required: false, placeholder: "proj_abc123" },
  ],
  secretKeys: ["revenuecat:secretKey"],
  aiSummaryPrompt: "Report RevenueCat subscription API status.",
  run: checkRevenuecat,
});

export { checkRevenuecat };
