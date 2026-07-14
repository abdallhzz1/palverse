import { apiClient } from "@/lib/api/client";
import { LoginRequest, LoginResponse, AuthUser, ApiSuccessResponse, BackendLoginData, BackendMeData } from "@/types/api";

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<BackendLoginData>>("/auth/login", payload);
    const data = response.data;
    return {
      token: data.token,
      tokenType: data.token_type,
      user: data.user,
    };
  },

  me: async (): Promise<AuthUser> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<BackendMeData>>("/auth/me");
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
