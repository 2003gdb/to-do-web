import { type ReactNode } from "react";
import { Card } from "./Card";

type Props = {
  label?: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </label>
      ) : null}
      <Card padded={false} className="px-4 py-3">
        {children}
      </Card>
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
