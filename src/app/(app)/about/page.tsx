"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { logout } from "@/services/authService";

export default function AboutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);

  const handleLogout = async () => {
    await logout();
    reset();
    router.replace("/login");
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      <PageHeader title="My account" />

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <p className="mb-1 text-xs font-semibold text-neutral-500">SIGNED IN</p>
          <p className="text-base text-neutral-900">{user?.email ?? "—"}</p>
          {user?.displayName ? (
            <p className="text-sm text-neutral-500">{user.displayName}</p>
          ) : null}
        </Card>

        <Card>
          <p className="mb-1 text-xs font-semibold text-neutral-500">ABOUT</p>
          <p className="text-sm text-neutral-700">
            To-Do is a simple task manager. Organize tasks into lists, set priorities and due
            dates, and discuss them with comments.
          </p>
        </Card>

        <Button label="Log out" onClick={handleLogout} />
      </div>
    </div>
  );
}
