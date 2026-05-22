import type { ProjectManifest, ProjectStackType } from "./types.js";

export interface ProjectPreset {
  slug: string;
  name: string;
  stackType: ProjectStackType;
  productionUrl: string;
  servicesDocFile: string;
  servicesPrivateFile?: string;
  currency: "EUR" | "USD";
  defaultConnectors: ProjectManifest["connectors"];
}

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    slug: "flowkeep",
    name: "FlowKeep",
    stackType: "macos-landing",
    productionUrl: "https://flowkeep.dev",
    servicesDocFile: "SERVICES.md",
    servicesPrivateFile: "SERVICES.private.md",
    currency: "EUR",
    defaultConnectors: [
      { id: "http",         enabled: true,  config: { url: "https://flowkeep.dev" } },
      { id: "github",       enabled: true,  config: { owner: "gordan007", repo: "flowkeep-app" } },
      { id: "checklist",    enabled: true,  config: {} },
      { id: "vercel",       enabled: true,  config: { projectName: "flowkeep-app" } },
      { id: "plausible",    enabled: true,  config: { domain: "flowkeep.dev" } },
      { id: "lemonsqueezy", enabled: false, config: {} },
      { id: "anthropic",    enabled: false, config: {} },
      { id: "supabase",     enabled: false, config: {} },
      { id: "firebase",     enabled: false, config: {} },
      { id: "revenuecat",   enabled: false, config: {} },
    ],
  },
  {
    slug: "ai-rules",
    name: "AI Rules Generator",
    stackType: "next-vercel-supabase",
    productionUrl: "https://ai-rules.dev",
    servicesDocFile: "SERVICES 2.md",
    servicesPrivateFile: "SERVICES.private 2.md",
    currency: "USD",
    defaultConnectors: [
      { id: "http",         enabled: true,  config: { url: "https://ai-rules.dev" } },
      { id: "github",       enabled: true,  config: { owner: "gordan007", repo: "ai-rules-generator" } },
      { id: "checklist",    enabled: true,  config: {} },
      { id: "vercel",       enabled: true,  config: { projectName: "ai-rules-generator" } },
      { id: "supabase",     enabled: true,  config: { url: "https://sbtnpwqjcexoyaltpeht.supabase.co" } },
      { id: "anthropic",    enabled: true,  config: {} },
      { id: "lemonsqueezy", enabled: true,  config: {} },
      { id: "plausible",    enabled: false, config: {} },
      { id: "firebase",     enabled: false, config: {} },
      { id: "revenuecat",   enabled: false, config: {} },
    ],
  },
  {
    slug: "captive",
    name: "CAPTIVE",
    stackType: "expo-firebase",
    productionUrl: "https://captiveapp.pages.dev",
    servicesDocFile: "SERVICES 3.md",
    servicesPrivateFile: "SERVICES.private 3.md",
    currency: "USD",
    defaultConnectors: [
      { id: "http",         enabled: true,  config: { url: "https://captiveapp.pages.dev" } },
      { id: "github",       enabled: true,  config: { owner: "gordan007", repo: "Captive" } },
      { id: "checklist",    enabled: true,  config: {} },
      { id: "firebase",     enabled: true,  config: { projectId: "captive-dfd7b" } },
      { id: "revenuecat",   enabled: true,  config: {} },
      { id: "anthropic",    enabled: true,  config: {} },
      { id: "vercel",       enabled: false, config: {} },
      { id: "supabase",     enabled: false, config: {} },
      { id: "plausible",    enabled: false, config: {} },
      { id: "lemonsqueezy", enabled: false, config: {} },
    ],
  },
];

export function getPreset(slug: string): ProjectPreset | undefined {
  return PROJECT_PRESETS.find((p) => p.slug === slug);
}
