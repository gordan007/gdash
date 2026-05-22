import type { ConnectorResult } from "@gdash/core";
import { Card } from "./ui/Card.js";
import { StatusBadge } from "./StatusBadge.js";

export function MetricCard({
  title,
  value,
  sub,
  result,
  loading,
}: {
  title: string;
  value: string;
  sub?: string;
  result?: ConnectorResult;
  loading?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 transition hover:-translate-y-px hover:shadow-md">
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="text-3xl font-bold tracking-tight">{loading ? "—" : value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
      {result && <StatusBadge status={result.status} text={result.message} />}
    </Card>
  );
}
