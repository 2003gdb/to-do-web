import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
