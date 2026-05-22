import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getSettings, updateSettings } from "@gdash/core";
import { listConnectors } from "@gdash/connectors";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Icon } from "../components/Icon.js";
import { getSecret, listSecretKeys, removeSecret, setSecret } from "../lib/secrets.js";

interface TokenField {
  key: string;
  label: string;
  connectorLabel: string;
  placeholder?: string;
}

export function SettingsPage() {
  const [pollMinutes, setPollMinutes] = useState(10);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const tokenFields: TokenField[] = listConnectors()
    .flatMap((c) =>
      (c.secretKeys ?? []).map((sk) => ({
        key: sk,
        label: sk,
        connectorLabel: c.label,
        placeholder: `Enter ${sk}…`,
      }))
    )
    .filter((f, i, arr) => arr.findIndex((x) => x.key === f.key) === i);

  useEffect(() => {
    void getSettings().then((s) => setPollMinutes(s.pollIntervalMinutes));
    const initial: Record<string, string> = {};
    for (const f of tokenFields) {
      initial[f.key] = getSecret(f.key) ?? "";
    }
    setTokens(initial);
    setSavedKeys(listSecretKeys());
  }, []);

  const saveAll = async () => {
    await updateSettings({ pollIntervalMinutes: pollMinutes });
    for (const [key, val] of Object.entries(tokens)) {
      if (val.trim()) setSecret(key, val.trim());
    }
    setSavedKeys(listSecretKeys());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteSecret = (key: string) => {
    removeSecret(key);
    setTokens((prev) => ({ ...prev, [key]: "" }));
    setSavedKeys(listSecretKeys());
  };

  const grouped = Object.entries(
    tokenFields.reduce<Record<string, TokenField[]>>((acc, f) => {
      const group = f.connectorLabel;
      if (!acc[group]) acc[group] = [];
      acc[group].push(f);
      return acc;
    }, {})
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <h2 className="font-semibold">Polling</h2>
        <label className="mt-4 block text-sm font-medium">
          Auto-refresh interval (minutes)
          <input
            type="number"
            min={1}
            max={120}
            className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2"
            value={pollMinutes}
            onChange={(e) => setPollMinutes(Number(e.target.value))}
          />
          <span className="mt-1 text-xs text-[var(--text-muted)]">
            Polling pauses when the window is hidden.
          </span>
        </label>
      </Card>

      <Card>
        <h2 className="font-semibold">API tokens</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Stored locally (localStorage / Keychain on macOS). Never committed to Git.
        </p>
        <div className="mt-4 space-y-6">
          {grouped.map(([connectorLabel, fields]) => (
            <div key={connectorLabel}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {connectorLabel}
              </p>
              <div className="space-y-3">
                {fields.map((f) => {
                  const hasSaved = savedKeys.includes(f.key);
                  return (
                    <div key={f.key} className="flex items-end gap-2">
                      <label className="flex-1 text-sm font-medium">
                        {f.key}
                        <input
                          type="password"
                          className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 outline-none focus:border-[var(--btn-primary-bg)]"
                          placeholder={hasSaved ? "•••••••• (saved)" : f.placeholder}
                          value={tokens[f.key] ?? ""}
                          onChange={(e) =>
                            setTokens((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                        />
                      </label>
                      {hasSaved && (
                        <Button
                          variant="ghost"
                          className="mb-0.5 !p-2 text-[var(--status-error)] hover:bg-red-50"
                          onClick={() => deleteSecret(f.key)}
                          aria-label={`Remove ${f.key}`}
                        >
                          <Icon icon={Trash2} size={15} />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {savedKeys.length > 0 && (
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            {savedKeys.length} key{savedKeys.length !== 1 ? "s" : ""} on file
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">iPhone (PWA)</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Run <code className="rounded bg-[var(--bg-muted)] px-1">npm run dev</code>, open Safari on your iPhone, Share → Add to Home Screen. Free, no App Store.
        </p>
      </Card>

      <Button variant="primary" onClick={() => void saveAll()}>
        {saved ? "Saved!" : "Save settings"}
      </Button>
    </div>
  );
}
