import { type ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-neutral-300 bg-white/40 px-6 py-12 text-center">
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      {description ? <p className="text-sm text-neutral-500 max-w-sm">{description}</p> : null}
      {action}
    </div>
  );
}
