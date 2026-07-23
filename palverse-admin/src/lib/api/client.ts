import axios from "axios";

import { normalizeApiError } from "./error";

export const apiClient = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Accept-Language": "ar",
  },
  timeout: 30000,
});

let isRedirectingToLogin = false;

apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-Request-ID"] =
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Let the browser set multipart boundary for FormData uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers["Content-Type"] = undefined;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = normalizeApiError(error);

    // Only hard-redirect on true unauthenticated responses — never on
    // timeouts/network blips (those are status 0 / 408).
    if (
      normalizedError.status === 401 &&
      normalizedError.code === "UNAUTHENTICATED" &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login") &&
      !isRedirectingToLogin
    ) {
      isRedirectingToLogin = true;
      window.location.href = "/login";
    }

    return Promise.reject(normalizedError);
  }
);
