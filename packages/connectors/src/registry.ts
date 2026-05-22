import type { ConnectorResult, ProjectManifest } from "@gdash/core";

export interface ConnectorDeps {
  fetchText: (path: string) => Promise<string | null>;
  getSecret: (key: string) => string | undefined;
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "secret" | "url";
  required: boolean;
  placeholder?: string;
  hint?: string;
}

export interface ConnectorDescriptor {
  id: string;
  label: string;
  icon: string;
  description: string;
  configSchema: ConfigField[];
  secretKeys?: string[];
  aiSummaryPrompt?: string;
  run: (
    project: ProjectManifest,
    config: Record<string, string>,
    deps: ConnectorDeps
  ) => Promise<ConnectorResult>;
}

const registry = new Map<string, ConnectorDescriptor>();

export function registerConnector(descriptor: ConnectorDescriptor): void {
  registry.set(descriptor.id, descriptor);
}

export function getConnector(id: string): ConnectorDescriptor | undefined {
  return registry.get(id);
}

export function listConnectors(): ConnectorDescriptor[] {
  return Array.from(registry.values());
}
