import { create } from "zustand";
import type { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }
    set({ token });
  },
  setHydrated: (hydrated) => set({ hydrated }),
  reset: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
