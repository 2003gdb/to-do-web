"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";

type Props = {
  title?: string;
  backHref?: string;
  right?: ReactNode;
};

export function PageHeader({ title, backHref, right }: Props) {
  return (
    <div className="flex items-end justify-between gap-3 px-4 pb-2 pt-10 md:px-6 md:pb-8 md:pt-14">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-text-secondary outline-none transition-colors hover:bg-surface-sunken hover:text-text-primary focus-visible:shadow-[var(--shadow-focus)]"
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
        ) : null}
        {title ? (
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{title}</h1>
        ) : null}
      </div>
      {right}
    </div>
  );
}
