import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadProjectCosts, summarizeCosts, type ProjectCosts } from "@gdash/core";
import { useGdash } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";

export function GlobalCostsPage() {
  const { data } = useGdash();
  const [byProject, setByProject] = useState<Record<string, ProjectCosts>>({});

  useEffect(() => {
    void (async () => {
      const map: Record<string, ProjectCosts> = {};
      for (const p of data.projects) {
        map[p.slug] = await loadProjectCosts(p, fetchServicesDoc);
      }
      setByProject(map);
    })();
  }, [data.projects]);

  let totalFixed = 0;
  for (const p of data.projects) {
    const c = byProject[p.slug];
    if (c) totalFixed += summarizeCosts(c, p.currency).fixedMonthly;
  }

  return (
    <div className="space-y-8">
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">Combined fixed monthly (parsed)</p>
        <p className="mt-2 text-3xl font-bold">{totalFixed > 0 ? `~${totalFixed.toFixed(0)}` : "—"}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {data.projects.map((p) => {
          const c = byProject[p.slug];
          const s = c ? summarizeCosts(c, p.currency) : null;
          return (
            <Link key={p.slug} to={`/projects/${p.slug}/costs`}>
              <Card className="hover:shadow-md">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{s?.totalLabel ?? "Loading…"}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
