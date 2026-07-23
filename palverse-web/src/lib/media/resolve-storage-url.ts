/**
 * Resolve API public-storage URLs for browser display.
 * Handles absolute URLs, /storage/... paths, and relative disk paths.
 */
export function resolveStorageUrl(
  value: string | null | undefined,
  apiBaseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const apiOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");

  if (trimmed.startsWith("/storage/")) {
    return `${apiOrigin}${trimmed}`;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    const path = trimmed.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${apiOrigin}/storage/${path}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.includes("/storage/")) {
      return `${apiOrigin}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
