"use client";

import { type ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Loading } from "@/components/common/Loading";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, hydrated } = useRequireAuth();

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loading />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
