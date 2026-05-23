export type ProjectStackType =
  | "macos-landing"
  | "next-vercel-supabase"
  | "expo-firebase";

export type ConnectorId = string;

export const BUILT_IN_CONNECTOR_IDS = [
  "http",
  "github",
  "checklist",
  "vercel",
  "supabase",
  "firebase",
  "anthropic",
  "revenuecat",
  "lemonsqueezy",
] as const;

export type ConnectorStatus = "ok" | "warn" | "error" | "pending" | "loading";

export interface ConnectorConfig {
  id: ConnectorId;
  enabled: boolean;
  /** Non-secret config (repo, URLs, project ids) */
  config: Record<string, string>;
}

export interface ProjectManifest {
  slug: string;
  name: string;
  stackType: ProjectStackType;
  productionUrl: string;
  repoPath: string;
  servicesDocPath: string;
  servicesPrivatePath?: string;
  currency: "EUR" | "USD";
  connectors: ConnectorConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorResult {
  id: ConnectorId;
  status: ConnectorStatus;
  label: string;
  message: string;
  checkedAt: string;
  meta?: Record<string, string | number | boolean>;
}

export interface ChecklistItem {
  id: string;
  service: string;
  status: "ok" | "warn" | "pending" | "phase2";
  note?: string;
}

export interface CostServiceRow {
  service: string;
  plan: string;
  monthly: string;
  yearly: string;
  renewal: string;
  status: string;
  dashboardUrl: string;
}

export interface CostMonthlyEntry {
  month: string;
  item: string;
  amount: number;
  currency: string;
  invoiceUrl?: string;
}

export interface ProjectCosts {
  services: CostServiceRow[];
  monthlyEntries: CostMonthlyEntry[];
  summaryEstimate?: string;
}

export interface ProjectCache {
  slug: string;
  connectorResults: ConnectorResult[];
  checklist: ChecklistItem[];
  costs?: ProjectCosts;
  refreshedAt: string;
}

export interface AppSettings {
  pollIntervalMinutes: number;
  importedPresets: boolean;
}

export interface GdashData {
  version: 1;
  projects: ProjectManifest[];
  cache: Record<string, ProjectCache>;
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  pollIntervalMinutes: 10,
  importedPresets: false,
};

export const DEFAULT_GDASH_DATA: GdashData = {
  version: 1,
  projects: [],
  cache: {},
  settings: DEFAULT_SETTINGS,
};
