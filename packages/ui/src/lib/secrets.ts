const PREFIX = "gdash-secret:";

export function getSecret(key: string): string | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage.getItem(PREFIX + key) ?? undefined;
}

export function setSecret(key: string, value: string): void {
  localStorage.setItem(PREFIX + key, value);
}

export function removeSecret(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function listSecretKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) keys.push(k.slice(PREFIX.length));
  }
  return keys;
}
