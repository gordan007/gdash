import type { ConnectorResult, ProjectManifest } from "@gdash/core";
import { getConnector, type ConnectorDeps } from "./registry.js";

export type { ConnectorDeps };

export async function runConnector(
  id: string,
  project: ProjectManifest,
  config: Record<string, string>,
  deps: ConnectorDeps
): Promise<ConnectorResult> {
  const descriptor = getConnector(id);
  if (!descriptor) {
    return {
      id,
      status: "pending",
      label: id,
      message: `Unknown connector: ${id}`,
      checkedAt: new Date().toISOString(),
    };
  }
  return descriptor.run(project, config, deps);
}
