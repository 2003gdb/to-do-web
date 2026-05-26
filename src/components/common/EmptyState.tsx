import { type ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-12 text-center">
      <p className="text-base font-medium text-text-primary">{title}</p>
      {description ? (
        <p className="text-sm text-text-secondary max-w-sm prose-measure">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
