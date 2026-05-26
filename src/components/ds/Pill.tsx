import { cn } from "@/utils/cn";

type Tone = "default" | "success" | "warning" | "danger" | "accent" | "dark";

type Props = {
  label: string;
  tone?: Tone;
  dot?: boolean;
};

const containerByTone: Record<Tone, string> = {
  default: "bg-surface-elevated border border-border-subtle",
  success: "bg-success-muted",
  warning: "bg-warning-muted",
  danger: "bg-danger-muted",
  accent: "bg-accent-muted",
  dark: "bg-text-primary/10",
};

const dotByTone: Record<Tone, string> = {
  default: "bg-text-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  accent: "bg-accent",
  dark: "bg-text-primary",
};

const textByTone: Record<Tone, string> = {
  default: "text-text-primary",
  success: "text-text-primary",
  warning: "text-text-primary",
  danger: "text-text-primary",
  accent: "text-text-primary",
  dark: "text-text-primary",
};

export function Pill({ label, tone = "default", dot }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-xs text-xs font-medium",
        containerByTone[tone],
        textByTone[tone]
      )}
    >
      {label}
      {dot ? <span className={cn("w-2 h-2 rounded-full", dotByTone[tone])} /> : null}
    </span>
  );
}
