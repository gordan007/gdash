import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Wallet,
  WifiOff,
} from "lucide-react";
import { refreshProject } from "@gdash/connectors";
import { loadGdashData } from "@gdash/core";
import { Icon } from "../components/Icon.js";
import { Button } from "../components/ui/Button.js";
import { CommandPalette } from "../components/CommandPalette.js";
import { useGdash } from "../context/GdashContext.js";
import { formatStaleMinutes } from "@gdash/connectors";
import { useOnlineStatus } from "../lib/network.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";
import { getSecret } from "../lib/secrets.js";
import { cn } from "../lib/cn.js";

const deps = { fetchText: fetchServicesDoc, getSecret };

const mainNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/costs", icon: Wallet, label: "Costs" },
];

function projectNav(slug: string) {
  return [
    { to: `/projects/${slug}`, icon: LayoutDashboard, label: "Overview" },
    { to: `/projects/${slug}/costs`, icon: Wallet, label: "Costs" },
    { to: `/projects/${slug}/settings`, icon: Settings, label: "Settings" },
  ];
}

export function AppShell() {
  const { pathname } = useLocation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, reload, refreshProjectBySlug, refreshing } = useGdash();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const project = slug ? data.projects.find((p) => p.slug === slug) : undefined;
  const cache = slug ? data.cache[slug] : undefined;
  const stale = cache ? formatStaleMinutes(cache.refreshedAt) : null;

  const onRefresh = async () => {
    if (refreshing) return;
    if (slug) {
      await refreshProjectBySlug(slug);
    } else {
      const current = await loadGdashData();
      await Promise.allSettled(current.projects.map((p) => refreshProject(p, deps)));
      await reload();
    }
  };

  const title =
    pathname === "/"
      ? "Dashboard"
      : pathname.startsWith("/projects/new")
        ? "New project"
        : pathname === "/costs"
          ? "Costs"
          : pathname === "/settings"
            ? "Settings"
            : project?.name ?? "Project";

  return (
    <div className="flex h-full min-h-0">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 show-mobile-only"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "hide-mobile flex w-60 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-4",
          mobileOpen && "show-mobile-only !flex fixed inset-y-0 left-0 z-40 w-64 shadow-xl"
        )}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-sm font-bold text-white">
            g
          </div>
          <span className="text-lg font-semibold">gdash</span>
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]"
        >
          <Icon icon={Search} size={16} />
          Search
          <span className="ml-auto text-xs">⌘K</span>
        </button>
        <nav className="flex flex-1 flex-col gap-1">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                )
              }
            >
              <Icon icon={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
          {data.projects.length > 0 && (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Projects
              </p>
              {data.projects.map((p) => (
                <NavLink
                  key={p.slug}
                  to={`/projects/${p.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      isActive
                        ? "bg-[var(--bg-muted)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                    )
                  }
                >
                  <span className="truncate">{p.name}</span>
                </NavLink>
              ))}
            </>
          )}
          {project && (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {project.name}
              </p>
              {projectNav(slug!).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/projects/${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
                      isActive
                        ? "bg-[var(--bg-muted)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                    )
                  }
                >
                  <Icon icon={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <Button
          variant="primary"
          className="mb-3 w-full"
          onClick={() => navigate("/projects/new")}
        >
          <Icon icon={Plus} size={18} className="text-white" />
          New project
        </Button>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-3 text-xs text-[var(--text-secondary)]">
          {stale !== null ? `Synced ${stale} min ago` : `${data.projects.length} project${data.projects.length !== 1 ? "s" : ""}`}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {!online && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <Icon icon={WifiOff} size={16} />
            Offline — showing cached data
          </div>
        )}
        <header className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-white px-4 py-4 md:px-8">
          <button
            type="button"
            className="show-mobile-only rounded-lg p-2 hover:bg-[var(--bg-muted)]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <Icon icon={Menu} size={22} />
          </button>
          <h1 className="flex-1 text-xl font-semibold md:text-2xl">{title}</h1>
          <Button variant="ghost" className="!p-2" onClick={() => navigate("/settings")} aria-label="Settings">
            <Icon icon={Settings} size={20} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <Icon icon={RefreshCw} size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Syncing…" : "Refresh"}
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <nav className="show-mobile-only flex border-t border-[var(--border-subtle)] bg-white px-2 py-2 safe-pb">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                  isActive ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                )
              }
            >
              <Icon icon={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
