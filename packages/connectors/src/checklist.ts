import { parseChecklistFromServices } from "@gdash/core";
import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkChecklist(
  project: ProjectManifest,
  _config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const { fetchText } = deps;
  const md = await fetchText(project.servicesDocPath);
  if (!md) {
    return {
      id: "checklist",
      status: "pending",
      label: "Checklist",
      message: "SERVICES doc not found",
      checkedAt: new Date().toISOString(),
    };
  }
  const items = parseChecklistFromServices(md);
  const pending = items.filter((i) => i.status === "pending").length;
  const warn = items.filter((i) => i.status === "warn").length;
  const ok = items.filter((i) => i.status === "ok").length;
  return {
    id: "checklist",
    status: pending > 0 ? "warn" : warn > 0 ? "warn" : "ok",
    label: "Checklist",
    message: `${ok} ok, ${warn} partial, ${pending} pending`,
    checkedAt: new Date().toISOString(),
    meta: { total: items.length, ok, warn, pending },
  };
}

registerConnector({
  id: "checklist",
  label: "Checklist",
  icon: "ListChecks",
  description: "Parses the SERVICES.md checklist table and reports pending / ok items.",
  configSchema: [],
  aiSummaryPrompt: "Summarize how many checklist items are done vs pending.",
  run: checkChecklist,
});

export { checkChecklist };
