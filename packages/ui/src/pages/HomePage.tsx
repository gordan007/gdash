import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatStaleMinutes } from "@gdash/connectors";
import { importPresetsFromDocs, shouldOfferPresetImport } from "@gdash/core";
import { useEffect, useState } from "react";
import { useGdash } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { StatusBadge } from "../components/StatusBadge.js";
import { Icon } from "../components/Icon.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";

export function HomePage() {
  const { data, reload } = useGdash();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [offerImport, setOfferImport] = useState(false);

  useEffect(() => {
    void shouldOfferPresetImport().then(setOfferImport);
  }, [data.projects.length]);

  const onImport = async () => {
    setImporting(true);
    try {
      await importPresetsFromDocs(fetchServicesDoc);
      await reload();
      setOfferImport(false);
    } catch {
      /* keep offer banner, user can retry */
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {offerImport && (
        <Card className="border-dashed bg-gradient-to-r from-emerald-50 to-sky-50">
          <h2 className="text-lg font-semibold">Import your products</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Load FlowKeep, AI Rules, and CAPTIVE from bundled services-docs.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => void onImport()} disabled={importing}>
            {importing ? "Importing…" : "Import presets"}
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.projects.map((p) => {
          const cache = data.cache[p.slug];
          const http = cache?.connectorResults.find((r) => r.id === "http");
          const stale = cache ? formatStaleMinutes(cache.refreshedAt) : null;
          return (
            <Link key={p.slug} to={`/projects/${p.slug}`}>
              <Card className="transition hover:-translate-y-px hover:shadow-md">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{p.productionUrl}</p>
                <div className="mt-4 flex items-center justify-between">
                  {http ? <StatusBadge status={http.status} text={http.label} /> : <StatusBadge status="pending" text="No data" />}
                  {stale !== null && (
                    <span className="text-xs text-[var(--text-muted)]">{stale}m ago</span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => navigate("/projects/new")}
          className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:bg-white"
        >
          <Icon icon={Plus} size={24} />
          <span className="text-sm font-medium">New project</span>
        </button>
      </div>
    </div>
  );
}
