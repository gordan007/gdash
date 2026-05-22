import type { ProjectManifest, ProjectStackType } from "./types.js";

export interface ProjectPreset {
  slug: string;
  name: string;
  stackType: ProjectStackType;
  productionUrl: string;
  servicesDocFile: string;
  defaultConnectors: ProjectManifest["connectors"];
}

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    slug: "flowkeep",
    name: "FlowKeep",
    stackType: "macos-landing",
    productionUrl: "https://flowkeep.dev",
    servicesDocFile: "SERVICES.md",
    defaultConnectors: [
      { id: "http", enabled: true, config: { url: "https://flowkeep.dev" } },
      {
        id: "github",
        enabled: true,
        config: { owner: "gordan007", repo: "flowkeep-app" },
      },
      { id: "checklist", enabled: true, config: {} },
      {
        id: "vercel",
        enabled: false,
        config: { projectName: "flowkeep-app" },
      },
      { id: "plausible", enabled: false, config: { domain: "flowkeep.dev" } },
    ],
  },
  {
    slug: "ai-rules",
    name: "AI Rules Generator",
    stackType: "next-vercel-supabase",
    productionUrl: "https://ai-rules.dev",
    servicesDocFile: "SERVICES 2.md",
    defaultConnectors: [
      { id: "http", enabled: true, config: { url: "https://ai-rules.dev" } },
      {
        id: "github",
        enabled: true,
        config: { owner: "gordan007", repo: "ai-rules-generator" },
      },
      { id: "checklist", enabled: true, config: {} },
      {
        id: "vercel",
        enabled: false,
        config: { projectName: "ai-rules-generator" },
      },
      { id: "supabase", enabled: false, config: {} },
      { id: "anthropic", enabled: false, config: {} },
    ],
  },
  {
    slug: "captive",
    name: "CAPTIVE",
    stackType: "expo-firebase",
    productionUrl: "https://captiveapp.pages.dev",
    servicesDocFile: "SERVICES 3.md",
    defaultConnectors: [
      {
        id: "http",
        enabled: true,
        config: { url: "https://captiveapp.pages.dev" },
      },
      {
        id: "github",
        enabled: true,
        config: { owner: "gordan007", repo: "Captive" },
      },
      { id: "checklist", enabled: true, config: {} },
      { id: "firebase", enabled: false, config: { projectId: "captive-dfd7b" } },
    ],
  },
];

export function getPreset(slug: string): ProjectPreset | undefined {
  return PROJECT_PRESETS.find((p) => p.slug === slug);
}
