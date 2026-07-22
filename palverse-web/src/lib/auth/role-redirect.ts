import { PublicUser } from "@/types/auth";
import { isMerchantRole, isRepresentativeRole, isFollowUpRole } from "./roles";

export function getPostLoginPath(
  user: PublicUser | null | undefined,
  requestedPath?: string | null
): string {
  if (!user) {
    return "/";
  }

  // Never redirect back to login
  if (requestedPath === "/login") {
    requestedPath = null;
  }

  // Validate internal path
  let safePath = null;
  if (requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//")) {
    safePath = requestedPath;
  }

  if (isMerchantRole(user.roles)) {
    return "/merchant"; // Merchants always go to their dashboard first
  }

  if (isRepresentativeRole(user.roles)) {
    return "/representative"; // Representatives go to their dashboard first
  }

  if (isFollowUpRole(user.roles)) {
    return "/follow-up";
  }

  // Non-operational roles (like legacy customers) have no dashboard, direct them to home or logout page.
  return "/";
}
