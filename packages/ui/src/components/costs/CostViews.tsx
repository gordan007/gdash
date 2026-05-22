import { summarizeCosts, type ProjectCosts, type ProjectManifest } from "@gdash/core";
import { Download, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../ui/Card.js";
import { Button } from "../ui/Button.js";
import { Icon } from "../Icon.js";
import { openExternal } from "../../lib/platform.js";
import { exportCostsToCSV } from "../../lib/export.js";

function isRenewalSoon(renewalStr: string): boolean {
  if (!renewalStr) return false;
  const match = renewalStr.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
  if (!match) return false;
  const date = new Date(match[1]);
  const daysAway = (date.getTime() - Date.now()) / 86_400_000;
  return daysAway >= 0 && daysAway <= 30;
}

function isRenewalOverdue(renewalStr: string): boolean {
  if (!renewalStr) return false;
  const match = renewalStr.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
  if (!match) return false;
  return new Date(match[1]).getTime() < Date.now();
}

export function CostSummaryRow({
  costs,
  currency,
}: {
  costs: ProjectCosts;
  currency: string;
}) {
  const s = summarizeCosts(costs, currency);
  const cards = [
    { label: "Fixed monthly", value: s.fixedMonthly > 0 ? `${s.fixedMonthly.toFixed(0)} ${currency}` : "—" },
    { label: "Yearly obligations", value: s.yearly > 0 ? `${s.yearly.toFixed(0)} ${currency}/yr` : "—" },
    { label: "Variable (est.)", value: s.variableLabel },
    { label: "Total (est.)", value: s.totalLabel },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <p className="text-sm text-[var(--text-secondary)]">{c.label}</p>
          <p className="mt-2 text-2xl font-bold">{c.value}</p>
        </Card>
      ))}
    </div>
  );
}

export function CostServiceTable({ costs }: { costs: ProjectCosts }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <th className="pb-3 pr-4 font-medium">Service</th>
            <th className="pb-3 pr-4 font-medium">Plan</th>
            <th className="pb-3 pr-4 font-medium">Monthly</th>
            <th className="pb-3 pr-4 font-medium">Yearly</th>
            <th className="pb-3 pr-4 font-medium">Renewal</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {costs.services.map((row, i) => {
            const overdue = isRenewalOverdue(row.renewal);
            const soon = !overdue && isRenewalSoon(row.renewal);
            return (
              <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                <td className="py-3 pr-4 font-medium">{row.service}</td>
                <td className="py-3 pr-4 text-[var(--text-secondary)]">{row.plan || "—"}</td>
                <td className="py-3 pr-4">{row.monthly || "—"}</td>
                <td className="py-3 pr-4">{row.yearly || "—"}</td>
                <td className={["py-3 pr-4 text-xs", overdue ? "font-semibold text-[var(--status-error)]" : soon ? "font-semibold text-[var(--status-warn)]" : ""].join(" ")}>
                  {row.renewal || "—"}
                </td>
                <td className="py-3">
                  {row.dashboardUrl && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                      onClick={() => void openExternal(row.dashboardUrl)}
                    >
                      Billing
                      <Icon icon={ExternalLink} size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {costs.services.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No services parsed from SERVICES doc.</p>
      )}
    </Card>
  );
}

export function CostMonthlyLedger({ costs }: { costs: ProjectCosts }) {
  if (costs.monthlyEntries.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 font-semibold">Monthly log</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Add entries in SERVICES.private.md to see actual spend history.
        </p>
      </Card>
    );
  }

  const chartData = costs.monthlyEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.month] = (acc[e.month] ?? 0) + e.amount;
    return acc;
  }, {});
  const chartEntries = Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, amount]) => ({ month: month.slice(0, 7), amount }));

  return (
    <div className="space-y-4">
      {chartEntries.length >= 2 && (
        <Card>
          <h3 className="mb-4 font-semibold">Spending trend (12 months)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartEntries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}
              />
              <Bar dataKey="amount" fill="var(--btn-primary-bg)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
      <Card>
        <h3 className="mb-4 font-semibold">Monthly log</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[var(--text-secondary)]">
              <th className="pb-2 pr-4 font-medium">Month</th>
              <th className="pb-2 pr-4 font-medium">Item</th>
              <th className="pb-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {costs.monthlyEntries.map((e, i) => (
              <tr key={i} className="border-t border-[var(--border-subtle)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">{e.month}</td>
                <td className="py-2 pr-4">{e.item}</td>
                <td className="py-2 font-medium">
                  {e.amount} {e.currency}
                  {e.invoiceUrl && (
                    <button
                      type="button"
                      className="ml-2 text-xs text-[var(--text-muted)] hover:underline"
                      onClick={() => void openExternal(e.invoiceUrl!)}
                    >
                      Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function ProjectCostsView({
  project,
  costs,
}: {
  project: ProjectManifest;
  costs: ProjectCosts;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{project.name} — Costs</h2>
          {costs.summaryEstimate && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Estimate from doc: {costs.summaryEstimate}
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={() => exportCostsToCSV(costs, project.slug)}>
          <Icon icon={Download} size={16} />
          Export CSV
        </Button>
      </div>
      <CostSummaryRow costs={costs} currency={project.currency} />
      <CostServiceTable costs={costs} />
      <CostMonthlyLedger costs={costs} />
    </div>
  );
}
