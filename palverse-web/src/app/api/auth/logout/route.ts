import { NextRequest } from "next/server";

import { handleLogout } from "@/lib/bff/auth-handlers";

export async function POST(request: NextRequest) {
  return handleLogout(request);
}
