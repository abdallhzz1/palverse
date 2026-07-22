import {
  ApiSuccessResponse,
  AuthUser,
  BackendLoginData,
  BackendMeData,
  LoginRequest,
  LoginResponse,
} from "@/types/api";

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
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await bffAuthRequest<
      ApiSuccessResponse<BackendLoginData>
    >("login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = response.data;

    return {
      token: data.token,
      tokenType: data.token_type,
      user: data.user,
    };
  },

  me: async (): Promise<AuthUser> => {
    const response =
      await bffAuthRequest<ApiSuccessResponse<BackendMeData>>("me");
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await bffAuthRequest("logout", { method: "POST" });
  },
};
