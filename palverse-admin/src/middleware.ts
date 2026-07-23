import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
} from "@/lib/bff/constants";
import { clearAuthCookies } from "@/lib/bff/cookie";

const PUBLIC_PATHS = new Set(["/login", "/unauthorized"]);

/**
 * Auth gate only — do NOT call /api/auth/me here.
 *
 * Calling the API on every navigation was logging admins out: any transient
 * upstream failure deleted the session cookie. Role checks use a lightweight
 * cookie set at login; the dashboard layout still verifies via /auth/me once.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand")
  ) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);
  const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;

  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === "/login" && hasAuthCookie && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prefer the login-time role hint. If it's missing (older sessions), allow
  // through and let the client layout confirm via /auth/me once — do not wipe
  // the session cookie on uncertain middleware failures.
  if (role && role !== "admin") {
    const redirect = NextResponse.redirect(new URL("/unauthorized", request.url));
    clearAuthCookies(redirect);
    return redirect;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
