import axios, { AxiosError } from "axios";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useAuthStore } from "@/store/useAuthStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

let signingOut = false;

export const api = axios.create({
  baseURL,
  timeout: 8000,
});

const AUTH_ROUTES = ["/login", "/register"];

api.interceptors.request.use(
  async (config) => {
    config.headers.Accept = "application/json";
    if (typeof window !== "undefined") {
      let token: string | null = null;
      try {
        const user = getFirebaseAuth().currentUser;
        if (user) {
          token = await user.getIdToken();
          localStorage.setItem("token", token);
        }
      } catch {
        // Firebase unavailable: fall through to cached token.
      }
      if (!token) token = localStorage.getItem("token");
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

    if (status === 401 && hasResponse && typeof window !== "undefined" && !signingOut) {
      signingOut = true;
      localStorage.removeItem("token");
      useAuthStore.getState().reset();
      const path = window.location.pathname;
      const onAuthRoute = AUTH_ROUTES.includes(path);
      const done = () => {
        if (!onAuthRoute) {
          window.location.replace("/login");
        } else {
          signingOut = false;
        }
      };
      try {
        const auth = getFirebaseAuth();
        const result = auth ? signOut(auth) : undefined;
        if (result && typeof (result as Promise<void>).then === "function") {
          (result as Promise<void>).catch(() => {}).finally(done);
        } else {
          done();
        }
      } catch {
        done();
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
