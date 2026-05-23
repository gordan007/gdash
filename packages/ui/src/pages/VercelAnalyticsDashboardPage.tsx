import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart2, ExternalLink } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useProject } from "../context/GdashContext.js";
import { getSecret } from "../lib/secrets.js";
import { Icon } from "../components/Icon.js";
import { Button } from "../components/ui/Button.js";
import { openExternal } from "../lib/platform.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "1d" | "7d" | "30d";

interface TimeseriesPoint {
  key: string;
  total: number;
  devices?: { desktop?: number; mobile?: number };
}

interface PageviewStats {
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: number;
  timeseries: TimeseriesPoint[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

const VERCEL_API = "https://vercel.com/api";

async function fetchAnalytics(
  projectId: string,
  teamId: string,
  token: string,
  period: Period
): Promise<PageviewStats> {
  const now = Date.now();
  const periodMs: Record<Period, number> = {
    "1d": 86_400_000,
    "7d": 7 * 86_400_000,
    "30d": 30 * 86_400_000,
  };
  const since = now - periodMs[period];
  const qs = new URLSearchParams({
    projectId,
    teamId,
    since: String(since),
    until: String(now),
    filter: JSON.stringify({}),
    limit: "250",
  });

  const headers = { Authorization: `Bearer ${token}` };
  const signal = AbortSignal.timeout(15_000);

  const [tsRes, summaryRes] = await Promise.all([
    fetch(`${VERCEL_API}/v1/web/analytics/timeseries?${qs}`, { headers, signal }),
    fetch(`${VERCEL_API}/v1/web/analytics?${qs}`, { headers, signal }),
  ]);

  if (!tsRes.ok && !summaryRes.ok) {
    throw new Error(`Vercel Analytics API ${tsRes.status}`);
  }

  type TsData = { data: { key: string; total: number }[] };
  type SummaryData = {
    data: {
      pageviews?: number;
      uniqueVisitors?: number;
      avgDuration?: number;
      bounceRate?: number;
    };
  };

  const ts = tsRes.ok ? ((await tsRes.json()) as TsData) : { data: [] };
  const summary = summaryRes.ok ? ((await summaryRes.json()) as SummaryData) : { data: {} };

  return {
    totalViews: summary.data?.pageviews ?? 0,
    uniqueVisitors: summary.data?.uniqueVisitors ?? 0,
    avgDuration: summary.data?.avgDuration ?? 0,
    bounceRate: summary.data?.bounceRate ?? 0,
    timeseries: ts.data ?? [],
  };
}

// project ID lookup via deployments API
async function resolveProjectId(projectName: string, token: string, teamId?: string): Promise<string | null> {
  try {
    const qs = new URLSearchParams({ teamId: teamId ?? "" });
    const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}

async function resolveTeamId(token: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.vercel.com/v2/teams?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { teams?: { id: string }[] };
    return data.teams?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDate(key: string) {
  const d = new Date(key);
  if (isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900 tabular-nums">
        {loading ? <span className="text-gray-200">—</span> : value}
      </p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 text-sm shadow-lg pointer-events-none">
      <p className="text-gray-400 text-xs mb-1">{label ? fmtDate(label) : ""}</p>
      <p className="font-bold">{fmtNum(payload[0].value)} views</p>
    </div>
  );
}

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "1d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export function VercelAnalyticsDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const [period, setPeriod] = useState<Period>("7d");
  const [stats, setStats] = useState<PageviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = getSecret("vercel:token");
  const projectName = project?.connectors.find((c) => c.id === "vercel")?.config.projectName;

  useEffect(() => {
    if (!token || !projectName) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const teamId = await resolveTeamId(token);
        const projectId = await resolveProjectId(projectName, token, teamId ?? undefined);
        if (!projectId) throw new Error("Project not found in Vercel");
        const data = await fetchAnalytics(projectId, teamId ?? "", token, period);
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token, projectName, period]);

  const analyticsUrl = projectName
    ? `https://vercel.com/${projectName}/analytics`
    : "https://vercel.com/dashboard";

  if (!project) {
    return <div className="py-20 text-center text-gray-400">Project not found.</div>;
  }

  if (!token || !projectName) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
        <Icon icon={BarChart2} size={36} className="mx-auto mb-4 text-gray-200" />
        <p className="text-lg font-semibold text-gray-700 mb-1">Vercel Analytics not configured</p>
        <p className="text-sm text-gray-400 mb-5">
          Enable the Vercel connector and add your API token in settings.
        </p>
        <Link
          to={`/projects/${slug}/settings`}
          className="inline-flex items-center gap-1 text-indigo-600 text-sm font-semibold hover:underline"
        >
          Go to settings →
        </Link>
      </div>
    );
  }

  const noData = !loading && !error && stats && stats.timeseries.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${slug}`}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Back to project"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h2>
            <p className="text-xs text-gray-400">Vercel Analytics · {projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  period === p.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={() => void openExternal(analyticsUrl)}>
            <Icon icon={ExternalLink} size={14} />
            Open in Vercel
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700 flex items-center justify-between gap-4">
          <span>{error} — Vercel Analytics API may require a paid plan.</span>
          <Button variant="secondary" onClick={() => void openExternal(analyticsUrl)}>
            <Icon icon={ExternalLink} size={14} />
            Open in Vercel
          </Button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Page Views" value={stats ? fmtNum(stats.totalViews) : "—"} loading={loading} />
        <SummaryCard label="Unique Visitors" value={stats ? fmtNum(stats.uniqueVisitors) : "—"} loading={loading} />
        <SummaryCard
          label="Avg Duration"
          value={stats && stats.avgDuration > 0 ? `${stats.avgDuration}s` : "—"}
          loading={loading}
        />
        <SummaryCard
          label="Bounce Rate"
          value={stats && stats.bounceRate > 0 ? `${stats.bounceRate}%` : "—"}
          loading={loading}
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-5">
          Page Views
        </p>

        {stats && stats.timeseries.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.timeseries} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="vercel-vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="key"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtDate}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtNum}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#vercel-vg)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center gap-3 text-gray-300 text-sm">
            {loading ? (
              "Loading…"
            ) : noData ? (
              <>
                <p>No data for this period</p>
                <Button variant="secondary" onClick={() => void openExternal(analyticsUrl)}>
                  <Icon icon={ExternalLink} size={14} />
                  View in Vercel Dashboard
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => void openExternal(analyticsUrl)}>
                <Icon icon={ExternalLink} size={14} />
                View Analytics in Vercel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
