import { handleMe } from "@/lib/bff/auth-handlers";

export async function GET() {
  return handleMe();
}
