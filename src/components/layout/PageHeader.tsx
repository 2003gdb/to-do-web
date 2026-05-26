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
    <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : null}
        {title ? <h1 className="text-3xl font-bold text-neutral-900">{title}</h1> : null}
      </div>
      {right}
    </div>
  );
}
