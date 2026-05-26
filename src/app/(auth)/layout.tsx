"use client";

import { type ReactNode } from "react";
import { useRedirectIfAuthed } from "@/hooks/useAuth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  useRedirectIfAuthed();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
