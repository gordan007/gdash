import { registerConnector, type ConnectorDeps } from "./registry.js";
import type { ConnectorResult, ProjectManifest } from "@gdash/core";

async function checkFirebase(
  _project: ProjectManifest,
  config: Record<string, string>,
  _deps: ConnectorDeps
): Promise<ConnectorResult> {
  const projectId = config.projectId;
  if (!projectId) {
    return {
      id: "firebase",
      status: "pending",
      label: "Firebase",
      message: "Project ID required",
      checkedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await fetch(
      `https://${projectId}.firebaseio.com/.json?shallow=true&limitToFirst=1`,
      { signal: AbortSignal.timeout(10000) }
    );
    return {
      id: "firebase",
      status: res.status === 401 || res.status === 404 ? "ok" : res.ok ? "ok" : "warn",
      label: "Firebase",
      message: `Project ${projectId} (${res.status})`,
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: "firebase",
      status: "warn",
      label: "Firebase",
      message: e instanceof Error ? e.message : "Could not probe",
      checkedAt: new Date().toISOString(),
    };
  }
}

registerConnector({
  id: "firebase",
  label: "Firebase",
  icon: "Flame",
  description: "Firebase Realtime Database probe — verifies project reachability.",
  configSchema: [
    { key: "projectId", label: "Project ID", type: "text", required: true, placeholder: "my-project" },
  ],
  aiSummaryPrompt: "Summarize Firebase project reachability.",
  run: checkFirebase,
});

export { checkFirebase };
