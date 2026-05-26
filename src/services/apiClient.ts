import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  timeout: 8000,
});

const AUTH_ROUTES = ["/login", "/register"];

api.interceptors.request.use(
  (config) => {
    config.headers.Accept = "application/json";
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const hasResponse = Boolean(error.response);

    if (status === 401 && hasResponse && typeof window !== "undefined") {
      localStorage.removeItem("token");
      const path = window.location.pathname;
      if (!AUTH_ROUTES.includes(path)) {
        window.location.replace("/login");
      }
    }
    if (status && status >= 500) {
      console.warn("Server error:", status, error.config?.url);
    }
    if (!hasResponse) {
      console.warn("Network error:", error.code ?? error.message, error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
