export const AUTH_COOKIE_NAME = "palverse_admin_auth";

export const AUTH_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? 60 * 60 * 24 * 7
);

const LOCAL_DEV_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

export function getApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api/v1"
  );
}

export function getTrustedOrigins(): string[] {
  const configured = process.env.TRUSTED_ORIGINS;

  const fromEnv = configured
    ? configured.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

  if (process.env.NODE_ENV === "production") {
    return fromEnv.length > 0 ? fromEnv : [];
  }

  return [...new Set([...fromEnv, ...LOCAL_DEV_ORIGINS])];
}
