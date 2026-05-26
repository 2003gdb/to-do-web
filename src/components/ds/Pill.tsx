import { cn } from "@/utils/cn";

type Tone = "default" | "success" | "warning" | "danger" | "accent" | "dark";

type Props = {
  label: string;
  tone?: Tone;
  dot?: boolean;
};

const containerByTone: Record<Tone, string> = {
  default: "bg-white shadow-sm",
  success: "bg-green-100",
  warning: "bg-amber-100",
  danger: "bg-red-100",
  accent: "bg-indigo-100",
  dark: "bg-black/10",
};

const dotByTone: Record<Tone, string> = {
  default: "bg-pink-400",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  accent: "bg-indigo-500",
  dark: "bg-black",
};

const textByTone: Record<Tone, string> = {
  default: "text-neutral-900",
  success: "text-neutral-900",
  warning: "text-neutral-900",
  danger: "text-neutral-900",
  accent: "text-neutral-900",
  dark: "text-neutral-900",
};

export function Pill({ label, tone = "default", dot }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
        containerByTone[tone],
        textByTone[tone]
      )}
    >
      {label}
      {dot ? <span className={cn("w-2 h-2 rounded-full", dotByTone[tone])} /> : null}
    </span>
  );
}
