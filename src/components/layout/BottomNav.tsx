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

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-neutral-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  active ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
