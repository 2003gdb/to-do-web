"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, User } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/categories", label: "Lists", Icon: Layers },
  { href: "/about", label: "Account", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-border-subtle bg-surface-elevated md:hidden">
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors outline-none focus-visible:bg-surface-sunken focus-visible:shadow-[var(--shadow-focus)]",
                  active
                    ? "bg-accent-muted text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                <Icon size={20} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
