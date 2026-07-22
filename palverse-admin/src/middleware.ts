import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/bff/constants";

const PUBLIC_PATHS = new Set(["/login", "/unauthorized"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === "/login" && request.cookies.has(AUTH_COOKIE_NAME)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the session and enforce the admin role via the same-origin BFF.
  try {
    const meResponse = await fetch(new URL("/api/auth/me", request.url), {
      method: "GET",
      headers: {
        Accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      // Invalid or expired session → back to login and drop the stale cookie.
      const redirect = NextResponse.redirect(new URL("/login", request.url));
      redirect.cookies.delete(AUTH_COOKIE_NAME);
      return redirect;
    }

    const payload = await meResponse.json();
    const roles: string[] = payload?.data?.user?.roles ?? [];

    if (!roles.includes("admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch {
    // If the identity check itself fails (network/BFF error), fail safe to login.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
