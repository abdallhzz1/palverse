import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getApiBaseUrl } from "./constants";
import {
  getAuthCookieClearOptions,
  getAuthCookieOptions,
} from "./cookie";
import { isTrustedRequest } from "./security";

type LaravelAuthPayload = {
  success?: boolean;
  data?: {
    token?: string;
    user?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function stripTokenFromPayload(payload: LaravelAuthPayload): LaravelAuthPayload {
  if (!payload.data) {
    return payload;
  }

  const { token: _token, ...safeData } = payload.data;

  return {
    ...payload,
    data: safeData,
  };
}

export async function handleLogin(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const body = await request.text();
  const upstream = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": request.headers.get("accept-language") ?? "ar",
    },
    body,
    cache: "no-store",
  });

  const payload = (await upstream.json()) as LaravelAuthPayload;
  const response = NextResponse.json(stripTokenFromPayload(payload), {
    status: upstream.status,
  });

  if (upstream.ok && payload.data?.token) {
    response.cookies.set(
      AUTH_COOKIE_NAME,
      payload.data.token,
      getAuthCookieOptions()
    );
  }

  return response;
}

export async function handleLogout(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out.",
    data: null,
    meta: [],
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", getAuthCookieClearOptions());

  return response;
}

export async function handleMe(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthenticated.",
        error: { code: "UNAUTHENTICATED", details: [] },
      },
      { status: 401 }
    );
  }

  const upstream = await fetch(`${getApiBaseUrl()}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await upstream.json();

  return NextResponse.json(payload, { status: upstream.status });
}
