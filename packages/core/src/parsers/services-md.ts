import type { ChecklistItem, CostServiceRow } from "../types.js";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .trim();
}

function parseTableRows(markdown: string, headerNeedle: string): string[][] {
  const lines = markdown.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(headerNeedle) && lines[i].includes("|")) {
      start = i;
      break;
    }
  }
  if (start < 0) return [];

  const rows: string[][] = [];
  for (let i = start + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    if (/^\|[\s\-:|]+\|$/.test(line.replace(/\s/g, ""))) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => stripMarkdown(c.trim()));
    if (cells.length > 1) rows.push(cells);
  }
  return rows;
}

export function parseChecklistFromServices(markdown: string): ChecklistItem[] {
  const rows = parseTableRows(markdown, "Račun / servis");
  if (rows.length === 0) {
    const alt = parseTableRows(markdown, "Servis");
    return mapChecklistRows(alt);
  }
  return mapChecklistRows(rows);
}

function mapChecklistRows(rows: string[][]): ChecklistItem[] {
  return rows.map((cells, i) => {
    const raw = cells.join(" ");
    let status: ChecklistItem["status"] = "pending";
    if (raw.includes("✅")) status = "ok";
    else if (raw.includes("🔶") || raw.includes("⚠")) status = "warn";
    else if (raw.includes("⏭")) status = "phase2";
    return {
      id: `chk-${i}`,
      service: cells[1] ?? cells[0] ?? "Unknown",
      status,
      note: cells[5] ?? undefined,
    };
  });
}

export function parseCostServicesFromServices(markdown: string): CostServiceRow[] {
  const rows = parseTableRows(markdown, "Master tablica");
  if (rows.length === 0) {
    const alt = parseTableRows(markdown, "| # | Servis |");
    return mapCostRows(alt);
  }
  return mapCostRows(rows);
}

function mapCostRows(rows: string[][]): CostServiceRow[] {
  return rows.map((cells) => {
    const hasNumberCol = /^\d+$/.test(cells[0] ?? "");
    const o = hasNumberCol ? 1 : 0;

    const service = cells[o] ?? "";
    if (!service) return null;

    const dashboardUrl = extractUrl(cells[o + 2] ?? cells[o + 1] ?? "");
    const plan = cells[o + 6] ?? cells[o + 4] ?? "";
    const monthly = cells[o + 7] ?? cells[o + 5] ?? "";
    const yearly = cells[o + 8] ?? cells[o + 6] ?? "";
    const renewal = cells[o + 9] ?? "";
    const status = cells[o + 10] ?? cells[o + 7] ?? "";

    return { service, plan, monthly, yearly, renewal, status, dashboardUrl };
  }).filter((r): r is CostServiceRow => r !== null && r.service.length > 0);
}

function extractUrl(text: string): string {
  const m = text.match(/https?:\/\/[^\s|)]+/);
  return m ? m[0].replace(/[)>.,]$/, "") : "";
}

export function parseSummaryEstimate(markdown: string): string | undefined {
  const m = markdown.match(/\*\*UKUPNO[^|]*\|[^|]*\|[^|]*\|\s*\*?\*?([^|*]+)/i);
  return m?.[1]?.trim();
}

export function parseCostsFromMarkdown(markdown: string): {
  services: CostServiceRow[];
  summaryEstimate?: string;
} {
  return {
    services: parseCostServicesFromServices(markdown),
    summaryEstimate: parseSummaryEstimate(markdown),
  };
}
