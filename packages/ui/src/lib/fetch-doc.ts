export async function fetchServicesDoc(path: string): Promise<string | null> {
  const file = path.replace(/^services-docs\//, "");
  const normalized = file.startsWith("/") ? file : `/${encodeURI(file)}`;
  const base = import.meta.env.BASE_URL ?? "/";
  const url = `${base}${normalized.replace(/^\//, "")}`.replace(/\/+/g, "/");
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
