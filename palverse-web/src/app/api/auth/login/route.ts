import { NextRequest } from "next/server";

import { handleLogin } from "@/lib/bff/auth-handlers";

export async function POST(request: NextRequest) {
  return handleLogin(request);
}
