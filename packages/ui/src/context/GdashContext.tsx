import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { refreshProject } from "@gdash/connectors";
import {
  getSettings,
  listProjects,
  loadGdashData,
  type GdashData,
  type ProjectCache,
  type ProjectManifest,
} from "@gdash/core";
import { fetchServicesDoc } from "../lib/fetch-doc.js";
import { getSecret } from "../lib/secrets.js";

type Ctx = {
  data: GdashData;
  loading: boolean;
  refreshing: boolean;
  reload: () => Promise<void>;
  refreshProjectBySlug: (slug: string) => Promise<ProjectCache | undefined>;
  getCache: (slug: string) => ProjectCache | undefined;
};

const GdashContext = createContext<Ctx | null>(null);

const deps = {
  fetchText: fetchServicesDoc,
  getSecret,
};

export function GdashProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GdashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef<number>(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const d = await loadGdashData();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!data) return;
    const pollMs = data.settings.pollIntervalMinutes * 60 * 1000;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const runPoll = async () => {
      const current = await loadGdashData();
      await Promise.allSettled(
        current.projects.map((p) => refreshProject(p, deps))
      );
      await reload();
    };

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(() => void runPoll(), pollMs);
    };

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState !== "hidden") start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [data?.settings.pollIntervalMinutes, reload]);

  const refreshProjectBySlug = useCallback(
    async (slug: string) => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 2000) return undefined;
      lastRefreshRef.current = now;

      setRefreshing(true);
      const current = await loadGdashData();
      const project = current.projects.find((p) => p.slug === slug);
      if (!project) {
        setRefreshing(false);
        return undefined;
      }
      const cache = await refreshProject(project, deps);
      await reload();
      setRefreshing(false);
      return cache;
    },
    [reload]
  );

  const value = useMemo<Ctx | null>(() => {
    if (!data) return null;
    return {
      data,
      loading,
      refreshing,
      reload,
      refreshProjectBySlug,
      getCache: (slug) => data.cache[slug],
    };
  }, [data, loading, refreshing, reload, refreshProjectBySlug]);

  if (!value) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }

  return <GdashContext.Provider value={value}>{children}</GdashContext.Provider>;
}

export function useGdash() {
  const ctx = useContext(GdashContext);
  if (!ctx) throw new Error("useGdash outside provider");
  return ctx;
}

export function useProject(slug: string | undefined): ProjectManifest | undefined {
  const { data } = useGdash();
  return data.projects.find((p) => p.slug === slug);
}
