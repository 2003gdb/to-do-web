"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Search, User } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/categories", label: "Lists", Icon: Layers },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/about", label: "Account", Icon: User },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border-subtle bg-surface-sunken md:flex md:flex-col">
      <div className="px-5 pb-6 pt-7">
        <Link
          href="/home"
          className="rounded-xs text-lg font-semibold tracking-tight text-text-primary outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          todo
        </Link>
      </div>
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
                    active
                      ? "bg-accent-muted font-medium text-text-primary"
                      : "font-medium text-text-muted hover:bg-surface-elevated hover:text-text-secondary"
                  )}
                >
                  <Icon size={18} aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
