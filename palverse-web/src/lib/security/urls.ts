const BLOCKED_SCHEMES = /^(javascript|data|vbscript|file):/i;

export function isSafeExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, "https://palverse.ps");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url || BLOCKED_SCHEMES.test(url.trim())) {
    return null;
  }

  return isSafeExternalUrl(url) ? url : null;
}

export function isSafeInternalPath(path: string | null | undefined): boolean {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;

  return true;
}
