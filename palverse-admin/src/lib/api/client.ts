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
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-Request-ID"] =
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Let the browser set multipart boundary for FormData uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(normalizedError);
  }
);
