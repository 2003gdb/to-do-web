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
  primary: "bg-accent text-accent-contrast hover:bg-accent-hover font-semibold",
  secondary: "bg-accent-muted text-text-primary hover:bg-accent-muted/80 font-medium",
  ghost: "bg-transparent border border-border text-text-primary hover:bg-surface-sunken font-medium",
  danger: "bg-danger text-accent-contrast hover:bg-danger/90 font-semibold",
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
        "inline-flex items-center justify-center gap-2 rounded-sm transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
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
