import type { NextRequest } from "next/server";

import { getTrustedOrigins } from "./constants";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function hostFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase();
}

function hostsMatch(left: string | null, right: string | null): boolean {
  if (!left || !right) {
    return false;
  }

  return normalizeHost(left) === normalizeHost(right);
}

function getRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (origin) {
    return normalizeOrigin(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return normalizeOrigin(new URL(referer).origin);
    } catch {
      return null;
    }
  }

  const host = request.headers.get("host");
  if (!host) {
    return null;
  }

  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return normalizeOrigin(`${protocol}://${host}`);
}

export function isTrustedRequest(request: NextRequest): boolean {
  const serverHost = request.headers.get("host");
  const requestOrigin = getRequestOrigin(request);
  const requestHost = requestOrigin ? hostFromOrigin(requestOrigin) : null;

  // Same-host BFF requests are trusted (login from the app's own domain).
  if (hostsMatch(requestHost, serverHost)) {
    return true;
  }

  if (!requestOrigin) {
    return process.env.NODE_ENV !== "production";
  }

  const trustedOrigins = getTrustedOrigins().map(normalizeOrigin);

  if (trustedOrigins.includes(requestOrigin)) {
    return true;
  }

  if (
    requestHost &&
    trustedOrigins.some((trusted) => hostsMatch(hostFromOrigin(trusted), requestHost))
  ) {
    return true;
  }

  if (process.env.NODE_ENV !== "production" && requestHost) {
    const hostname = normalizeHost(requestHost);
    return hostname === "localhost" || hostname === "127.0.0.1";
  }

  return false;
}
