import type { ProjectCosts } from "@gdash/core";

function escapeCell(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function rowToCsv(cells: string[]): string {
  return cells.map(escapeCell).join(",");
}

export function exportCostsToCSV(costs: ProjectCosts, slug: string): void {
  const rows: string[] = [
    rowToCsv(["Service", "Plan", "Monthly", "Yearly", "Renewal", "Status"]),
    ...costs.services.map((s) =>
      rowToCsv([s.service, s.plan, s.monthly, s.yearly, s.renewal, s.status])
    ),
  ];

  if (costs.monthlyEntries.length > 0) {
    rows.push("");
    rows.push(rowToCsv(["Month", "Item", "Amount", "Currency"]));
    rows.push(
      ...costs.monthlyEntries.map((e) =>
        rowToCsv([e.month, e.item, String(e.amount), e.currency])
      )
    );
  }

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `costs-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
