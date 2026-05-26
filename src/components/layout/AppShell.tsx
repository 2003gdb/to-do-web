import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <SideNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col md:max-w-3xl md:px-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
