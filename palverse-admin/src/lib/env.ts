import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_LOCALE: z.string().default("ar"),
  NEXT_PUBLIC_APP_DIRECTION: z.enum(["rtl", "ltr"]).default("rtl"),
  NEXT_PUBLIC_API_VERSION: z.string().default("1.0.0"),
});

const _env = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_LOCALE: process.env.NEXT_PUBLIC_APP_LOCALE,
  NEXT_PUBLIC_APP_DIRECTION: process.env.NEXT_PUBLIC_APP_DIRECTION,
  NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
});

if (!_env.success) {
  console.error(
    "❌ Invalid environment variables:",
    _env.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
