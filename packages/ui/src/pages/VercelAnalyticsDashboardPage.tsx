import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart2, ExternalLink, RefreshCw } from "lucide-react";
import { useGdash, useProject } from "../context/GdashContext.js";
import { Icon } from "../components/Icon.js";
import { Button } from "../components/ui/Button.js";
import { Card } from "../components/ui/Card.js";
import { StatusBadge } from "../components/StatusBadge.js";
import { openExternal } from "../lib/platform.js";

interface TeamInfo { slug: string }

async function resolveTeamSlug(token: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.vercel.com/v2/teams?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { teams?: TeamInfo[] };
    return data.teams?.[0]?.slug ?? null;
  } catch {
    return null;
  }
}

export function VercelAnalyticsDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const { getCache, refreshProjectBySlug, refreshing } = useGdash();
  const cache = slug ? getCache(slug) : undefined;

  const [analyticsUrl, setAnalyticsUrl] = useState<string | null>(null);

  const vercelConnector = project?.connectors.find((c) => c.id === "vercel");
  const projectName = vercelConnector?.config.projectName;
  const vercelResult = cache?.connectorResults.find((r) => r.id === "vercel");

  // Import getSecret inline to avoid circular dep
  const token = (() => {
    try { return localStorage.getItem("secret:vercel:token"); } catch { return null; }
  })();

  useEffect(() => {
    if (!projectName) return;
    if (token) {
      resolveTeamSlug(token).then((teamSlug) => {
        if (teamSlug) {
          setAnalyticsUrl(`https://vercel.com/${teamSlug}/${projectName}/analytics`);
        } else {
          setAnalyticsUrl(`https://vercel.com/dashboard`);
        }
      });
    } else {
      setAnalyticsUrl("https://vercel.com/dashboard");
    }
  }, [token, projectName]);

  if (!project) {
    return <div className="py-20 text-center text-gray-400">Project not found.</div>;
  }

  if (!vercelConnector?.enabled || !projectName) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
        <Icon icon={BarChart2} size={36} className="mx-auto mb-4 text-gray-200" />
        <p className="text-lg font-semibold text-gray-700 mb-1">Vercel Analytics not configured</p>
        <p className="text-sm text-gray-400 mb-5">
          Enable the Vercel connector and set the project name in settings.
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => slug && void refreshProjectBySlug(slug)}
            disabled={refreshing}
          >
            <Icon icon={RefreshCw} size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
          {analyticsUrl && (
            <Button variant="primary" onClick={() => void openExternal(analyticsUrl)}>
              <Icon icon={ExternalLink} size={16} />
              Open Vercel Analytics
            </Button>
          )}
        </div>
      </div>

      {/* Open in Vercel CTA */}
      <div
        className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-8 flex flex-col items-center text-center gap-4 cursor-pointer hover:from-indigo-100/80 hover:to-violet-100/80 transition-colors"
        onClick={() => analyticsUrl && void openExternal(analyticsUrl)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && analyticsUrl && void openExternal(analyticsUrl)}
      >
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <Icon icon={BarChart2} size={28} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">View Analytics Dashboard</p>
          <p className="text-sm text-gray-500 max-w-sm">
            Vercel Analytics data lives in your Vercel dashboard. Click to open pageviews,
            visitors, top pages, countries and more.
          </p>
        </div>
        {analyticsUrl && (
          <Button variant="primary" onClick={(e) => { e.stopPropagation(); void openExternal(analyticsUrl); }}>
            <Icon icon={ExternalLink} size={16} />
            Open in Vercel
          </Button>
        )}
      </div>

      {/* Deployment status card */}
      <Card>
        <h3 className="font-semibold mb-4">Latest Deployment</h3>
        {vercelResult ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{projectName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{vercelResult.message}</p>
            </div>
            <StatusBadge status={vercelResult.status} text={vercelResult.status === "ok" ? "Ready" : vercelResult.status} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No deployment data yet —{" "}
            <button
              type="button"
              className="text-indigo-600 hover:underline"
              onClick={() => slug && void refreshProjectBySlug(slug)}
            >
              click Refresh
            </button>
          </p>
        )}
        {vercelResult?.meta?.url && (
          <button
            type="button"
            className="mt-3 text-xs text-indigo-500 hover:underline"
            onClick={() => void openExternal(String(vercelResult.meta!.url))}
          >
            {String(vercelResult.meta.url)} ↗
          </button>
        )}
      </Card>

      {/* Analytics tracking info */}
      <Card>
        <h3 className="font-semibold mb-3">Analytics Setup</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>
              <code className="bg-gray-100 rounded px-1 text-xs">@vercel/analytics/react</code> aktivan u projektu
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>Custom eventi: <code className="bg-gray-100 rounded px-1 text-xs">track()</code> u <code className="bg-gray-100 rounded px-1 text-xs">lib/analytics.ts</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold mt-0.5">i</span>
            <span className="text-gray-400">
              Vercel Analytics nema javni REST API — podaci su dostupni samo u Vercel dashboardu.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
