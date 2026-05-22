import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkLemonsqueezy(
  _project: ProjectManifest,
  _config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { getSecret } = deps;
  const apiKey = getSecret("lemonsqueezy:apiKey");

  if (!apiKey) {
    return {
      id: "lemonsqueezy",
      status: "pending",
      label: "Lemon Squeezy",
      message: "API key not configured",
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/stores", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (res.status === 401) {
      return {
        id: "lemonsqueezy",
        status: "error",
        label: "Lemon Squeezy",
        message: "Invalid API key",
        checkedAt: new Date().toISOString(),
      };
    }

    if (!res.ok) {
      return {
        id: "lemonsqueezy",
        status: "error",
        label: "Lemon Squeezy",
        message: `API ${res.status}`,
        checkedAt: new Date().toISOString(),
      };
    }

    const data = (await res.json()) as {
      data?: { id: string; attributes?: { name: string; currency: string } }[];
    };
    const storeCount = data.data?.length ?? 0;
    const storeName = data.data?.[0]?.attributes?.name;

    return {
      id: "lemonsqueezy",
      status: "ok",
      label: "Lemon Squeezy",
      message: storeName ? `Store: ${storeName}` : `${storeCount} store(s)`,
      checkedAt: new Date().toISOString(),
      meta: { storeCount },
    };
  } catch (e) {
    return {
      id: "lemonsqueezy",
      status: "error",
      label: "Lemon Squeezy",
      message: e instanceof Error ? e.message : "Check failed",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "lemonsqueezy",
  label: "Lemon Squeezy",
  icon: "ShoppingCart",
  description: "Validates Lemon Squeezy API key and lists your stores.",
  configSchema: [],
  secretKeys: ["lemonsqueezy:apiKey"],
  aiSummaryPrompt: "Report Lemon Squeezy store status and revenue.",
  run: checkLemonsqueezy,
});

export { checkLemonsqueezy };
