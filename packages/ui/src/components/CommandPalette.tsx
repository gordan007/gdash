import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Settings,
  Wallet,
} from "lucide-react";
import { useGdash } from "../context/GdashContext.js";
import { Icon } from "./Icon.js";
import { cn } from "../lib/cn.js";

interface PaletteItem {
  id: string;
  label: string;
  sub?: string;
  path: string;
  icon: typeof LayoutDashboard;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useGdash();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allItems: PaletteItem[] = [
    { id: "dash", label: "Dashboard", path: "/", icon: LayoutDashboard },
    { id: "costs", label: "All costs", path: "/costs", icon: Wallet },
    { id: "new", label: "New project", path: "/projects/new", icon: Plus },
    { id: "settings", label: "Settings", path: "/settings", icon: Settings },
    ...data.projects.map((p) => ({
      id: `p:${p.slug}`,
      label: p.name,
      sub: p.productionUrl,
      path: `/projects/${p.slug}`,
      icon: LayoutDashboard,
    })),
  ];

  const items = q
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(q.toLowerCase()) ||
          i.sub?.toLowerCase().includes(q.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    if (open) {
      setQ("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [q]);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        const item = items[selected];
        if (item) {
          navigate(item.path);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, selected, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="w-full border-b border-[var(--border-subtle)] px-4 py-3.5 text-base outline-none placeholder:text-[var(--text-muted)]"
          placeholder="Jump to…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No results for &ldquo;{q}&rdquo;
          </p>
        ) : (
          <ul ref={listRef} className="max-h-72 overflow-auto py-2">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                    i === selected
                      ? "bg-[var(--bg-muted)] font-medium"
                      : "hover:bg-[var(--bg-muted)]"
                  )}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  <Icon icon={item.icon} size={16} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.sub && (
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">{item.sub}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-muted)]">
          <span className="mr-3">↑↓ navigate</span>
          <span className="mr-3">↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
