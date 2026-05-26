"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
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
    <div className="pb-12">
      <PageHeader title="My account" />

      <div className="px-4 md:px-6">
        <dl className="mb-10 flex flex-col gap-5 border-b border-border-subtle pb-10 md:mb-12 md:pb-12">
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-medium text-text-secondary">Signed in</dt>
            <dd className="text-base text-text-primary">{user?.email ?? "Not set"}</dd>
          </div>
          {user?.displayName ? (
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-text-secondary">Name</dt>
              <dd className="text-base text-text-primary">{user.displayName}</dd>
            </div>
          ) : null}
        </dl>

        <Button label="Log out" variant="ghost" onClick={handleLogout} />
      </div>
    </div>
  );
}
