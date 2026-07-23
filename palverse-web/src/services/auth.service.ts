import { apiClient } from "@/lib/api/client";
import {
  AuthSession,
  BaseResponse,
  LoginResponse,
  PublicUser,
  VerificationState,
  NotificationMeta,
} from "@/types/auth";

async function bffAuthRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.message || "Authentication request failed.");
    (error as unknown as Record<string, unknown>).status = response.status;
    (error as unknown as Record<string, unknown>).data = payload;
    throw error;
  }

  return payload as T;
}

export const authService = {
  async registerMerchant(
    credentials: Record<string, unknown>
  ): Promise<LoginResponse> {
    const res = await bffAuthRequest<BaseResponse<LoginResponse>>(
      "register/merchant",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    return res.data;
  },

  async login(credentials: Record<string, string>): Promise<LoginResponse> {
    const res = await bffAuthRequest<BaseResponse<LoginResponse>>("login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await bffAuthRequest("logout", { method: "POST" });
  },

  async me(): Promise<PublicUser> {
    const res = await bffAuthRequest<BaseResponse<{ user: PublicUser }>>("me");
    return res.data.user;
  },

  async updateProfile(
    data: Record<string, unknown>
  ): Promise<{ user: PublicUser }> {
    const res = await apiClient.put<
      never,
      BaseResponse<{ user: PublicUser }>
    >("/auth/profile", data);
    return res.data;
  },

  async updateAvatar(
    file: File
  ): Promise<{ avatar_url: string; user: PublicUser }> {
    const formData = new FormData();
    formData.append("avatar", file);
    // Do not set Content-Type manually — browser must include multipart boundary.
    const res = await apiClient.post<
      never,
      { message: string; avatar_url: string; user: PublicUser }
    >("/auth/profile/avatar", formData);
    return {
      avatar_url: res.avatar_url,
      user: res.user,
    };
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(data: Record<string, string>): Promise<void> {
    await apiClient.post("/auth/reset-password", data);
  },

  async getVerificationStatus(): Promise<VerificationState> {
    const res = await apiClient.get<never, BaseResponse<VerificationState>>(
      "/auth/email/status"
    );
    return res.data;
  },

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post("/auth/email/verification-notification");
  },

  async getSessions(): Promise<AuthSession[]> {
    const res = await apiClient.get<never, BaseResponse<AuthSession[]>>(
      "/auth/sessions"
    );
    return res.data;
  },

  async revokeSession(publicId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${publicId}`);
  },

  async revokeAllSessions(): Promise<number> {
    const res = await apiClient.delete<
      never,
      BaseResponse<{ revoked_count: number }>
    >("/auth/sessions/all");
    return res.data.revoked_count;
  },

  async revokeOtherSessions(): Promise<number> {
    const res = await apiClient.delete<
      never,
      BaseResponse<{ revoked_count: number }>
    >("/auth/sessions/others");
    return res.data.revoked_count;
  },

  async getNotifications(): Promise<{
    data: NotificationMeta[];
    meta: unknown;
  }> {
    const res = await apiClient.get<
      never,
      BaseResponse<{ data: NotificationMeta[]; meta: unknown }>
    >("/notifications");
    return res as unknown as { data: NotificationMeta[]; meta: unknown };
  },

  async getUnreadNotificationCount(): Promise<number> {
    const res = await apiClient.get<never, BaseResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return res.data.count;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all");
  },
};
