export type AppRole =
  | "admin"
  | "merchant"
  | "customer"
  | "representative"
  | "follow_up"
  | "executive_manager";

export function hasRole(
  roles: readonly string[] | null | undefined,
  role: string
): boolean {
  return roles?.includes(role) ?? false;
}

export function isMerchantRole(
  roles: readonly string[] | null | undefined
): boolean {
  return hasRole(roles, "merchant");
}

export function isRepresentativeRole(
  roles: readonly string[] | null | undefined
): boolean {
  return hasRole(roles, "representative");
}

export function isFollowUpRole(
  roles: readonly string[] | null | undefined
): boolean {
  return hasRole(roles, "follow_up");
}
