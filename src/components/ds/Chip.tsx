"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  selected?: boolean;
  size?: Size;
  dot?: boolean;
};

const sizeContainer: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
};

export function Chip({
  label,
  selected = false,
  size = "md",
  dot,
  disabled,
  className,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
        sizeContainer[size],
        selected
          ? "bg-accent text-accent-contrast"
          : "bg-surface-elevated text-text-primary border border-border-subtle hover:bg-surface-sunken",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span>{label}</span>
      {dot ? (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            selected ? "bg-accent-contrast" : "bg-text-muted"
          )}
        />
      ) : null}
    </button>
  );
}
