import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, CircleCheck, CircleX } from "lucide-react";
import {
  getPreset,
  PROJECT_PRESETS,
  upsertProject,
  type ProjectManifest,
  type ProjectStackType,
} from "@gdash/core";
import { listConnectors, runConnector, type ConnectorDescriptor } from "@gdash/connectors";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Icon } from "../components/Icon.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";
import { getSecret, setSecret } from "../lib/secrets.js";

const STEPS = ["Identity", "Stack", "Connectors", "Costs", "Review"];

const deps = { fetchText: fetchServicesDoc, getSecret };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [stackType, setStackType] = useState<ProjectStackType>("next-vercel-supabase");
  const [productionUrl, setProductionUrl] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [servicesDocPath, setServicesDocPath] = useState("");
  const [servicesPrivatePath, setServicesPrivatePath] = useState("");
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [enabledConnectors, setEnabledConnectors] = useState<Set<string>>(
    new Set(["http", "github", "checklist"])
  );
  const [connectorSecrets, setConnectorSecrets] = useState<Record<string, string>>({});
  const [tests, setTests] = useState<{ id: string; ok: boolean; message: string }[]>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const allConnectors = listConnectors().filter(
    (c) => c.id !== "checklist" && c.id !== "http"
  );

  useEffect(() => {
    if (!slugManual && name) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  const applyPreset = (presetSlug: string) => {
    const p = getPreset(presetSlug);
    if (!p) return;
    setName(p.name);
    setSlug(p.slug);
    setSlugManual(true);
    setStackType(p.stackType);
    setProductionUrl(p.productionUrl);
    setServicesDocPath(p.servicesDocFile);
    setEnabledConnectors(
      new Set(p.defaultConnectors.filter((c) => c.enabled).map((c) => c.id))
    );
  };

  const buildManifest = (): ProjectManifest => {
    const now = new Date().toISOString();
    const preset = getPreset(slug);
    const presetConns = preset?.defaultConnectors ?? [];
    const connectors = listConnectors().map((c) => {
      const presetConn = presetConns.find((x) => x.id === c.id);
      const config: Record<string, string> = presetConn?.config ? { ...presetConn.config } : {};
      if (c.id === "http" && productionUrl) config.url = productionUrl;
      for (const f of c.configSchema) {
        const val = connectorSecrets[`${c.id}:${f.key}`];
        if (val) config[f.key] = val;
      }
      return {
        id: c.id,
        enabled: enabledConnectors.has(c.id) || c.id === "checklist",
        config,
      };
    });

    return {
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
      stackType,
      productionUrl,
      repoPath,
      servicesDocPath,
      servicesPrivatePath: servicesPrivatePath || undefined,
      currency,
      connectors,
      createdAt: now,
      updatedAt: now,
    };
  };

  const runTests = async () => {
    for (const [key, val] of Object.entries(connectorSecrets)) {
      if (val.trim()) setSecret(key, val.trim());
    }
    const manifest = buildManifest();
    setTesting(true);
    const results: { id: string; ok: boolean; message: string }[] = [];
    for (const c of manifest.connectors.filter((x) => x.enabled)) {
      const r = await runConnector(c.id, manifest, c.config, deps);
      results.push({ id: c.id, ok: r.status === "ok" || r.status === "warn", message: r.message });
    }
    setTests(results);
    setTesting(false);
  };

  const finish = async () => {
    setSaving(true);
    for (const [key, val] of Object.entries(connectorSecrets)) {
      if (val.trim()) setSecret(key, val.trim());
    }
    const manifest = buildManifest();
    await upsertProject(manifest);
    navigate(`/projects/${manifest.slug}`);
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0 && slug.trim().length > 0 && productionUrl.trim().length > 0;
    if (step === 3) return servicesDocPath.trim().length > 0;
    return true;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                i === step
                  ? "bg-[var(--btn-primary-bg)] text-white"
                  : i < step
                    ? "bg-emerald-100 text-emerald-700 cursor-pointer"
                    : "bg-[var(--bg-muted)] text-[var(--text-muted)] cursor-default",
              ].join(" ")}
            >
              {i < step ? <Icon icon={Check} size={14} /> : i + 1}
            </button>
            <span
              className={[
                "hidden text-sm sm:block",
                i === step ? "font-semibold" : "text-[var(--text-muted)]",
              ].join(" ")}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <Icon icon={ChevronRight} size={16} className="text-[var(--text-muted)]" />
            )}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Project identity</h2>
            <label className="block text-sm font-medium">
              Project name
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="My App"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Slug
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="my-app"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              />
              <span className="mt-1 text-xs text-[var(--text-muted)]">Used in URL and storage. Auto-generated from name.</span>
            </label>
            <label className="block text-sm font-medium">
              Production URL
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="https://myapp.com"
                value={productionUrl}
                onChange={(e) => setProductionUrl(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Repo path (local, optional)
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="~/Sites/my-app"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Stack & presets</h2>
            <p className="text-sm text-[var(--text-secondary)]">Quick-fill from a preset:</p>
            <div className="flex flex-wrap gap-2">
              {PROJECT_PRESETS.map((p) => (
                <Button key={p.slug} variant="secondary" onClick={() => applyPreset(p.slug)}>
                  {p.name}
                </Button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Stack type
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2"
                value={stackType}
                onChange={(e) => setStackType(e.target.value as ProjectStackType)}
              >
                <option value="macos-landing">macOS + landing</option>
                <option value="next-vercel-supabase">Next + Vercel + Supabase</option>
                <option value="expo-firebase">Expo + Firebase</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Connectors</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Toggle connectors on/off. Secrets are stored locally only.
            </p>
            <div className="space-y-3">
              {allConnectors.map((c) => {
                const on = enabledConnectors.has(c.id);
                return (
                  <div key={c.id} className="rounded-xl border border-[var(--border-subtle)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{c.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{c.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(enabledConnectors);
                          if (on) next.delete(c.id);
                          else next.add(c.id);
                          setEnabledConnectors(next);
                        }}
                        className={[
                          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
                          on ? "bg-[var(--btn-primary-bg)]" : "bg-[var(--border-subtle)]",
                        ].join(" ")}
                        role="switch"
                        aria-checked={on}
                      >
                        <span className={[
                          "absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                          on ? "translate-x-4" : "translate-x-0.5",
                        ].join(" ")} />
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
                              placeholder={`Enter ${sk}…`}
                              value={connectorSecrets[sk] ?? ""}
                              onChange={(e) =>
                                setConnectorSecrets((prev) => ({ ...prev, [sk]: e.target.value }))
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    {on && c.configSchema.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-3">
                        {c.configSchema.filter((f) => f.required).map((f) => (
                          <label key={f.key} className="block text-xs font-medium text-[var(--text-secondary)]">
                            {f.label}
                            <input
                              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--btn-primary-bg)]"
                              placeholder={f.placeholder ?? ""}
                              onChange={(e) =>
                                setConnectorSecrets((prev) => ({
                                  ...prev,
                                  [`${c.id}:${f.key}`]: e.target.value,
                                }))
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Cost tracking</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Point to your SERVICES.md files for cost parsing. These files live in <code className="rounded bg-[var(--bg-muted)] px-1">services-docs/</code>.
            </p>
            <label className="block text-sm font-medium">
              SERVICES.md filename <span className="text-[var(--status-error)]">*</span>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="SERVICES.md"
                value={servicesDocPath}
                onChange={(e) => setServicesDocPath(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              SERVICES.private.md filename (optional)
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                placeholder="SERVICES.private.md"
                value={servicesPrivatePath}
                onChange={(e) => setServicesPrivatePath(e.target.value)}
              />
              <span className="mt-1 text-xs text-[var(--text-muted)]">Gitignored — contains actual costs.</span>
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
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Review & test</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--text-secondary)]">Name</dt>
                <dd className="font-medium">{name}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--text-secondary)]">Slug</dt>
                <dd className="font-mono text-sm">{slug}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--text-secondary)]">URL</dt>
                <dd className="truncate">{productionUrl}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                <dt className="text-[var(--text-secondary)]">Stack</dt>
                <dd>{stackType}</dd>
              </div>
              <div className="flex justify-between pb-2">
                <dt className="text-[var(--text-secondary)]">Connectors</dt>
                <dd>{[...enabledConnectors, "checklist"].join(", ")}</dd>
              </div>
            </dl>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => void runTests()} disabled={testing}>
                {testing ? "Testing…" : "Test connectors"}
              </Button>
              {tests.length > 0 && (
                <span className="text-sm text-[var(--text-muted)]">
                  {tests.filter((t) => t.ok).length}/{tests.length} passed
                </span>
              )}
            </div>
            {tests.length > 0 && (
              <ul className="space-y-2 rounded-xl border border-[var(--border-subtle)] p-3">
                {tests.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <Icon
                      icon={t.ok ? CircleCheck : CircleX}
                      size={16}
                      className={t.ok ? "text-[var(--status-ok)]" : "text-[var(--status-error)]"}
                    />
                    <span className="w-24 shrink-0 font-medium">{t.id}</span>
                    <span className="text-[var(--text-secondary)]">{t.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={() => void finish()} disabled={saving}>
            {saving ? "Creating…" : "Create project"}
          </Button>
        )}
      </div>
    </div>
  );
}
