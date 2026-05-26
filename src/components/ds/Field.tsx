import { type ReactNode } from "react";

type Props = {
  label?: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, htmlFor, children, hint }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}
