"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
};

const containerByVariant: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-neutral-800",
  secondary: "bg-indigo-100 text-neutral-900 hover:bg-indigo-200",
  ghost: "bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeContainer: Record<Size, string> = {
  md: "px-4 py-3 text-sm",
  lg: "px-5 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    label,
    variant = "primary",
    size = "lg",
    icon,
    iconRight,
    loading,
    loadingLabel,
    fullWidth,
    disabled,
    className,
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors outline-none",
        sizeContainer[size],
        containerByVariant[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {!iconRight && icon}
      <span>{loading && loadingLabel ? loadingLabel : label}</span>
      {iconRight && icon}
    </button>
  );
});
