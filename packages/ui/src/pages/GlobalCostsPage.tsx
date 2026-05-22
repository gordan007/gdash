import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { loadProjectCosts, summarizeCosts, type ProjectCosts } from "@gdash/core";
import { useGdash } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Icon } from "../components/Icon.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";
import { useNavigate } from "react-router-dom";

export function GlobalCostsPage() {
  const { data } = useGdash();
  const navigate = useNavigate();
  const [byProject, setByProject] = useState<Record<string, ProjectCosts>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.projects.length === 0) { setLoading(false); return; }
    void (async () => {
      const map: Record<string, ProjectCosts> = {};
      await Promise.allSettled(
        data.projects.map(async (p) => {
          try {
            map[p.slug] = await loadProjectCosts(p, fetchServicesDoc);
          } catch {
            map[p.slug] = { services: [], monthlyEntries: [] };
          }
        })
      );
      setByProject(map);
      setLoading(false);
    })();
  }, [data.projects]);

  if (data.projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[var(--text-secondary)]">No projects yet.</p>
        <Button variant="primary" onClick={() => navigate("/projects/new")}>
          <Icon icon={Plus} size={16} className="text-white" />
          New project
        </Button>
      </div>
    );
  }

  let totalFixed = 0;
  for (const p of data.projects) {
    const c = byProject[p.slug];
    if (c) totalFixed += summarizeCosts(c, p.currency).fixedMonthly;
  }

  return (
    <div className="space-y-8">
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">Combined fixed monthly</p>
        <p className="mt-2 text-3xl font-bold">
          {loading ? "…" : totalFixed > 0 ? `~${totalFixed.toFixed(0)}` : "—"}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Parsed from SERVICES docs. Variable costs excluded.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {data.projects.map((p) => {
          const c = byProject[p.slug];
          const s = c ? summarizeCosts(c, p.currency) : null;
          return (
            <Link key={p.slug} to={`/projects/${p.slug}/costs`}>
              <Card className="transition hover:-translate-y-px hover:shadow-md">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {loading ? "Loading…" : s ? s.totalLabel : "No cost data"}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
