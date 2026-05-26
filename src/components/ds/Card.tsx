import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  dark?: boolean;
  children: ReactNode;
};

export function Card({ padded = true, dark = false, className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-md border border-border-subtle",
        dark
          ? "bg-text-primary text-accent-contrast"
          : "bg-surface-elevated text-text-primary",
        padded && "p-5",
        "shadow-[var(--shadow-soft-1)]",
        className
      )}
    >
      {children}
    </div>
  );
}
