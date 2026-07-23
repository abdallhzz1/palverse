import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
} from "./constants";

export function getAuthCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export function getAuthCookieClearOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

export function getAuthRoleCookieOptions(): Partial<ResponseCookie> {
  return getAuthCookieOptions();
}

export function clearAuthCookies(response: {
  cookies: { set: (name: string, value: string, options: Partial<ResponseCookie>) => void };
}): void {
  const clearOptions = getAuthCookieClearOptions();
  response.cookies.set(AUTH_COOKIE_NAME, "", clearOptions);
  response.cookies.set(AUTH_ROLE_COOKIE_NAME, "", clearOptions);
}

export { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME };
