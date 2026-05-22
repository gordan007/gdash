import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { deleteProject, upsertProject } from "@gdash/core";
import { listConnectors } from "@gdash/connectors";
import { useGdash, useProject } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Icon } from "../components/Icon.js";
import { getSecret, setSecret } from "../lib/secrets.js";

export function ProjectSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const { reload } = useGdash();
  const navigate = useNavigate();

  const [name, setName] = useState(project?.name ?? "");
  const [productionUrl, setProductionUrl] = useState(project?.productionUrl ?? "");
  const [repoPath, setRepoPath] = useState(project?.repoPath ?? "");
  const [servicesDocPath, setServicesDocPath] = useState(project?.servicesDocPath ?? "");
  const [currency, setCurrency] = useState<"EUR" | "USD">(project?.currency ?? "EUR");
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    new Set(project?.connectors.filter((c) => c.enabled).map((c) => c.id) ?? [])
  );
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!project) return <p className="text-[var(--text-secondary)]">Project not found.</p>;

  const allConnectors = listConnectors().filter(
    (c) => c.id !== "checklist" && c.id !== "http"
  );

  const save = async () => {
    setSaving(true);
    for (const [key, val] of Object.entries(secrets)) {
      if (val.trim()) setSecret(key, val.trim());
    }
    const connectors = [
      ...allConnectors.map((c) => {
        const existing = project.connectors.find((x) => x.id === c.id);
        return {
          id: c.id,
          enabled: enabledIds.has(c.id),
          config: existing?.config ?? {},
        };
      }),
      {
        id: "http",
        enabled: true,
        config: { url: productionUrl },
      },
      {
        id: "checklist",
        enabled: true,
        config: {},
      },
    ];
    await upsertProject({ ...project, name, productionUrl, repoPath, servicesDocPath, currency, connectors });
    await reload();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteProject(project.slug);
    await reload();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <h2 className="font-semibold">Project details</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Production URL
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
              value={productionUrl}
              onChange={(e) => setProductionUrl(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Repo path (local)
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
              placeholder="~/Sites/my-app"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            SERVICES.md filename
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
              value={servicesDocPath}
              onChange={(e) => setServicesDocPath(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Currency
            <select
              className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "EUR" | "USD")}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Connectors</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Toggle integrations. API secrets are stored locally.
        </p>
        <div className="mt-4 space-y-3">
          {allConnectors.map((c) => {
            const on = enabledIds.has(c.id);
            return (
              <div key={c.id} className="rounded-xl border border-[var(--border-subtle)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{c.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Set(enabledIds);
                      if (on) next.delete(c.id);
                      else next.add(c.id);
                      setEnabledIds(next);
                    }}
                    className={["relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-[var(--btn-primary-bg)]" : "bg-[var(--border-subtle)]"].join(" ")}
                    role="switch"
                    aria-checked={on}
                  >
                    <span className={["absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", on ? "translate-x-4" : "translate-x-0.5"].join(" ")} />
                  </button>
                </div>
                {on && c.secretKeys && c.secretKeys.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-3">
                    {c.secretKeys.map((sk) => (
                      <label key={sk} className="block text-xs font-medium text-[var(--text-secondary)]">
                        {sk.replace(":", " ")}
                        <input
                          type="password"
                          className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--btn-primary-bg)]"
                          placeholder={getSecret(sk) ? "•••••••• (saved)" : `Enter ${sk}…`}
                          value={secrets[sk] ?? ""}
                          onChange={(e) => setSecrets((prev) => ({ ...prev, [sk]: e.target.value }))}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="primary" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          variant="ghost"
          className="text-[var(--status-error)] hover:bg-red-50"
          onClick={() => void handleDelete()}
        >
          <Icon icon={Trash2} size={16} />
          {confirmDelete ? "Confirm delete?" : "Delete project"}
        </Button>
      </div>

      <Card className="bg-[var(--bg-muted)]">
        <p className="text-xs text-[var(--text-muted)]">
          <strong>Slug:</strong> {project.slug} &nbsp;·&nbsp;
          <strong>Stack:</strong> {project.stackType} &nbsp;·&nbsp;
          <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </Card>
    </div>
  );
}
