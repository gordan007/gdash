import type { ChecklistItem, CostServiceRow } from "../types.js";

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
      .map((c) => c.trim());
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
    const statusCell = cells[4] ?? cells[3] ?? "";
    let status: ChecklistItem["status"] = "pending";
    if (statusCell.includes("✅")) status = "ok";
    else if (statusCell.includes("🔶") || statusCell.includes("⚠")) status = "warn";
    else if (statusCell.includes("⏭")) status = "phase2";
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
    const offset = hasNumberCol ? 1 : 0;
    return {
      service: cells[offset] ?? "",
      plan: cells[offset + 4] ?? cells[offset + 3] ?? "",
      monthly: cells[offset + 5] ?? cells[offset + 4] ?? "",
      yearly: cells[offset + 6] ?? cells[offset + 5] ?? "",
      renewal: cells[offset + 7] ?? "",
      status: cells[offset + 8] ?? cells[offset + 7] ?? "",
      dashboardUrl: extractUrl(cells[offset + 2] ?? cells[offset + 1] ?? ""),
    };
  });
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
