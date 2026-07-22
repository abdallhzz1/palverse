export type Role = string;

export interface PublicUser {
  public_id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_locale: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string | null;
  email_verified_at: string | null;
  created_at?: string | null;
  roles: Role[];
  permissions?: string[];
}

export interface AuthSession {
  public_id: string;
  device_name: string;
  device_type: string;
  ip_address: string | null;
  last_used_at: string;
  created_at: string;
  is_current: boolean;
}

export interface VerificationState {
  email: string;
  is_verified: boolean;
  email_verified_at: string | null;
  verification_required: boolean;
  can_resend: boolean;
}

export interface NotificationMeta {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: string;
  data: {
    title: string;
    body: string;
    action_url?: string;
    entity_type?: string;
    entity_id?: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token?: string;
  token_type: string;
  session: AuthSession;
  user: PublicUser;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    details: Record<string, unknown>;
  };
}
