import axios from "axios";
import { API_BASE_URL, TOKEN_STORAGE_KEY } from "@/lib/constants";
import { normalizeApiError } from "./error";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Add a unique request ID (simplified version)
    config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Only return the data part
    return response.data;
  },
  (error) => {
    const normalizedError = normalizeApiError(error);
    
    // Global 401 handling to ensure session clears and redirects
    if (normalizedError.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Only redirect if not already on login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(normalizedError);
  }
);
