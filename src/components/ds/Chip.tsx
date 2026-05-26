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
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors outline-none",
        sizeContainer[size],
        selected
          ? "bg-black text-white shadow-md"
          : "bg-white text-neutral-900 shadow-sm hover:bg-neutral-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span>{label}</span>
      {dot ? (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            selected ? "bg-white" : "bg-pink-400"
          )}
        />
      ) : null}
    </button>
  );
}
