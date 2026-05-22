import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ExternalLink, FolderOpen, RefreshCw, Wallet } from "lucide-react";
import { formatStaleMinutes } from "@gdash/connectors";
import { useGdash, useProject } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";
import { MetricCard } from "../components/MetricCard.js";
import { Button } from "../components/ui/Button.js";
import { Icon } from "../components/Icon.js";
import { StatusBadge, ChecklistStatusIcon } from "../components/StatusBadge.js";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { openExternal, openPath } from "../lib/platform.js";

const STACK_LABELS: Record<string, string> = {
  "macos-landing": "macOS + Landing",
  "next-vercel-supabase": "Next + Vercel + Supabase",
  "expo-firebase": "Expo + Firebase",
};

export function ProjectDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const { getCache, refreshProjectBySlug, refreshing } = useGdash();
  const cache = slug ? getCache(slug) : undefined;

  useEffect(() => {
    if (slug && !cache) void refreshProjectBySlug(slug);
  }, [slug]);

  if (!project) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-[var(--text-secondary)]">Project not found.</p>
      </div>
    );
  }

  const results = cache?.connectorResults ?? [];
  const http = results.find((r) => r.id === "http");
  const github = results.find((r) => r.id === "github");
  const plausible = results.find((r) => r.id === "plausible");
  const vercel = results.find((r) => r.id === "vercel");
  const revenuecat = results.find((r) => r.id === "revenuecat");
  const lemonsqueezy = results.find((r) => r.id === "lemonsqueezy");
  const stale = cache ? formatStaleMinutes(cache.refreshedAt) : null;
  const isStale = stale !== null && stale > 20;

  const analyticsResult = plausible ?? vercel;
  const revenueResult = revenuecat ?? lemonsqueezy;

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <Card className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
                  {STACK_LABELS[project.stackType] ?? project.stackType}
                </span>
              </div>
              <button
                type="button"
                className="mt-1 text-sm text-[var(--text-secondary)] hover:underline"
                onClick={() => void openExternal(project.productionUrl)}
              >
                {project.productionUrl}
              </button>
              {stale !== null && (
                <p className={["mt-2 flex items-center gap-1 text-xs", isStale ? "text-[var(--status-warn)]" : "text-[var(--text-muted)]"].join(" ")}>
                  {isStale && <Icon icon={AlertTriangle} size={12} />}
                  Updated {stale} min ago
                </p>
              )}
              {!cache && !refreshing && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">No data yet — click Refresh.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => slug && void refreshProjectBySlug(slug)}
                disabled={refreshing}
              >
                <Icon icon={RefreshCw} size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button variant="secondary" onClick={() => void openExternal(project.productionUrl)}>
                <Icon icon={ExternalLink} size={16} />
                Open site
              </Button>
              {project.repoPath && (
                <Button variant="secondary" onClick={() => void openPath(project.repoPath)}>
                  <Icon icon={FolderOpen} size={16} />
                  Repo
                </Button>
              )}
              <Link to={`/projects/${slug}/costs`}>
                <Button variant="primary">
                  <Icon icon={Wallet} size={16} className="text-white" />
                  Costs
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Site"
            value={http?.meta?.statusCode?.toString() ?? "—"}
            sub={http?.meta?.latencyMs ? `${http.meta.latencyMs}ms` : undefined}
            result={http}
            loading={refreshing && !http}
          />
          <MetricCard
            title="CI / Deploy"
            value={
              github
                ? github.status === "ok"
                  ? "Passing"
                  : github.status === "error"
                    ? "Failed"
                    : "—"
                : vercel
                  ? vercel.status === "ok"
                    ? "Ready"
                    : "—"
                  : "—"
            }
            sub={github?.message?.slice(0, 24) ?? vercel?.message?.slice(0, 24)}
            result={github ?? vercel}
            loading={refreshing && !github && !vercel}
          />
          <MetricCard
            title="Analytics"
            value={
              analyticsResult?.meta?.visitors != null
                ? String(analyticsResult.meta.visitors)
                : "—"
            }
            sub={analyticsResult ? "7d visitors" : undefined}
            result={analyticsResult}
            loading={refreshing && !analyticsResult}
          />
          <MetricCard
            title="Revenue"
            value={revenueResult?.status === "ok" ? "Active" : "—"}
            result={revenueResult}
            loading={refreshing && !revenueResult}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="mb-4 font-semibold">Integrations</h3>
            {results.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Click Refresh to load connector statuses.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((r) => {
                  const rateLimitLow =
                    r.id === "github" &&
                    typeof r.meta?.rateLimitRemaining === "number" &&
                    r.meta.rateLimitRemaining < 100;
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 last:border-0"
                    >
                      <div>
                        <span className="font-medium capitalize">{r.label}</span>
                        {rateLimitLow && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                            Rate limit: {String(r.meta?.rateLimitRemaining)} left
                          </span>
                        )}
                      </div>
                      <StatusBadge status={r.status} text={r.message} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Checklist</h3>
            {(cache?.checklist ?? []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No checklist data.</p>
            ) : (
              <>
                <ul className="max-h-72 space-y-2 overflow-auto text-sm">
                  {(cache?.checklist ?? []).slice(0, 15).map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <ChecklistStatusIcon status={item.status} />
                      <span className="text-[var(--text-secondary)]">{item.service}</span>
                    </li>
                  ))}
                </ul>
                {(cache?.checklist ?? []).length > 15 && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    +{(cache?.checklist.length ?? 0) - 15} more
                  </p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
