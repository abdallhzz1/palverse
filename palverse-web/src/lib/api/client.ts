import axios from "axios";

import { env } from "../env";

export const apiClient = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Accept-Language": env.NEXT_PUBLIC_APP_LOCALE,
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "An unexpected error occurred. Please try again later.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as unknown as Record<string, unknown>).status =
      error.response?.status || 500;
    (enhancedError as unknown as Record<string, unknown>).requestId =
      error.response?.headers?.["x-request-id"] || null;
    (enhancedError as unknown as Record<string, unknown>).data =
      error.response?.data || null;

    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("palverse:unauthorized"));
    }

    return Promise.reject(enhancedError);
  }
);
