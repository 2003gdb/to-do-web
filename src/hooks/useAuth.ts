"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeAuth } from "@/services/authService";

export function useAuthHydrator() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (cached) setToken(cached);
    // No cached token = no session to wait for; hydrate now.
    if (!cached) setHydrated(true);

    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeAuth((user, token) => {
        setUser(user);
        setToken(token);
        setHydrated(true);
      });
    } catch (err) {
      console.error("[auth] firebase init failed:", err);
      setHydrated(true);
    }
    // Safety: never block UI more than 2s.
    const fallback = setTimeout(() => setHydrated(true), 2000);
    return () => {
      clearTimeout(fallback);
      unsub?.();
    };
  }, [setUser, setToken, setHydrated]);
}

export function useRequireAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  return { user, hydrated };
}

export function useRedirectIfAuthed() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && user) router.replace("/home");
  }, [hydrated, user, router]);
}
