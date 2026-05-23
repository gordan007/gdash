export type Platform = "web" | "tauri";

export function getPlatform(): Platform {
  if (typeof window !== "undefined" && "__TAURI__" in window) {
    return "tauri";
  }
  return "web";
}

export async function openExternal(url: string): Promise<void> {
  const invoke = (window as Window & { __TAURI_INTERNALS__?: { invoke: (cmd: string, args: object) => Promise<unknown> } })
    .__TAURI_INTERNALS__?.invoke;
  if (invoke) {
    await invoke("plugin:opener|open_url", { url, openWith: null });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function openPath(path: string): Promise<void> {
  const invoke = (window as Window & { __TAURI_INTERNALS__?: { invoke: (cmd: string, args: object) => Promise<unknown> } })
    .__TAURI_INTERNALS__?.invoke;
  if (invoke) {
    await invoke("open_path", { path });
  }
}
