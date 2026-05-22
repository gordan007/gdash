import { parseCostsFromMarkdown } from "./parsers/services-md.js";
import type { CostMonthlyEntry, ProjectCosts, ProjectManifest } from "./types.js";

export function buildCostsFromMarkdown(
  markdown: string,
  monthlyEntries: CostMonthlyEntry[] = []
): ProjectCosts {
  const parsed = parseCostsFromMarkdown(markdown);
  return {
    services: parsed.services.filter((s) => s.service.length > 0),
    monthlyEntries,
    summaryEstimate: parsed.summaryEstimate,
  };
}

export function parseMonthlyFromPrivateMarkdown(markdown: string): CostMonthlyEntry[] {
  const rows: CostMonthlyEntry[] = [];
  const lines = markdown.split("\n");
  let inTable = false;
  for (const line of lines) {
    if (line.includes("Mjesečna tablica") || line.includes("Evidencija troškova po mjesecima")) {
      inTable = true;
      continue;
    }
    if (!inTable || !line.trim().startsWith("|")) continue;
    if (/^\|[\s\-:|]+\|$/.test(line.replace(/\s/g, ""))) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 3 || cells[0] === "Mjesec") continue;
    const amount = parseFloat(cells[2]?.replace(/[^\d.]/g, "") ?? "");
    if (!Number.isFinite(amount)) continue;
    rows.push({
      month: cells[0],
      item: cells[1],
      amount,
      currency: cells[3] || "EUR",
      invoiceUrl: cells[4]?.match(/https?:\/\/\S+/)?.[0],
    });
  }
  return rows;
}

export function summarizeCosts(costs: ProjectCosts, currency: string) {
  let fixedMonthly = 0;
  let yearly = 0;
  let hasEstimate = false;

  for (const row of costs.services) {
    const m = parseMoney(row.monthly);
    const y = parseMoney(row.yearly);
    if (m !== null) fixedMonthly += m;
    else if (row.monthly.includes("upiši") || row.monthly.includes("_")) hasEstimate = true;
    if (y !== null) yearly += y;
  }

  const variableLabel = costs.summaryEstimate ?? (hasEstimate ? "See SERVICES doc" : "—");

  return {
    fixedMonthly,
    yearly,
    variableLabel,
    totalLabel:
      fixedMonthly > 0
        ? `${fixedMonthly.toFixed(0)} ${currency}/mo + variable`
        : variableLabel,
    currency,
  };
}

function parseMoney(value: string): number | null {
  if (!value || value.includes("var") || value.includes("%")) return null;
  const n = parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function loadProjectCosts(
  manifest: ProjectManifest,
  fetchText: (path: string) => Promise<string | null>
): Promise<ProjectCosts> {
  let markdown = await fetchText(manifest.servicesDocPath);
  if (!markdown && manifest.servicesDocPath) {
    markdown = await fetchText(manifest.servicesDocPath.replace(/^services-docs\//, ""));
  }
  let monthly: CostMonthlyEntry[] = [];
  if (manifest.servicesPrivatePath) {
    const priv = await fetchText(manifest.servicesPrivatePath);
    if (priv) monthly = parseMonthlyFromPrivateMarkdown(priv);
  }
  if (!markdown) {
    return { services: [], monthlyEntries: monthly };
  }
  return buildCostsFromMarkdown(markdown, monthly);
}
