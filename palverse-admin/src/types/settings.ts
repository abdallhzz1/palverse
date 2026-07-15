import { ApiSuccessResponse } from "./api";

export type SettingType = "string" | "integer" | "decimal" | "boolean" | "email" | "url" | "json";

export interface SettingField {
  public_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  type: SettingType;
  is_public: boolean;
  description_ar: string | null;
  description_en: string | null;
}

export type SettingsGroup = Record<string, SettingField>;
export type SystemSettings = Record<string, SettingsGroup>;

export type SettingsResponse = ApiSuccessResponse<SystemSettings>;
export type SettingsGroupResponse = ApiSuccessResponse<SettingsGroup>;

export interface UpdateSettingsRequest {
  settings: Record<string, Record<string, unknown>>;
}

export interface UpdateSettingsGroupRequest {
  settings: Record<string, unknown>;
}

// Strictly typed config whitelist for frontend forms
export const SETTINGS_GROUPS = [
  "general",
  "branding",
  "contact",
  "social",
  "application",
  "maintenance"
] as const;

export type SettingsGroupName = typeof SETTINGS_GROUPS[number];
