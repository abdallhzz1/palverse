import { NextRequest } from "next/server";

import { handleRegisterMerchant } from "@/lib/bff/auth-handlers";

export async function POST(request: NextRequest) {
  return handleRegisterMerchant(request);
}
